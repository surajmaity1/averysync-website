import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// ─── Wire protocol types (must match Go server domain/models.go) ─────────────

type MsgType =
  | 'offer'
  | 'answer'
  | 'ice_candidate' // both directions — was 'candidate' on client before (bug #1)
  | 'end_space'
  | 'space_ended'
  | 'peer_joined'
  | 'peer_left'
  | 'error'

interface Signal {
  type: MsgType
  sdp?: string
  candidate?: RTCIceCandidateInit
  peer_id?: string
  message?: string
}

// ─── Callbacks exposed to the React layer ────────────────────────────────────

interface ManagerCallbacks {
  onConnectionStateChange: (state: RTCPeerConnectionState) => void
  onTrackReceived: (stream: MediaStream) => void
  onSpaceEnded: (message: string) => void
  onPeerJoined: (peerId: string) => void
  onPeerLeft: (peerId: string) => void
}

// ─── SpaceStreamManager ──────────────────────────────────────────────────────

class SpaceStreamManager {
  private pc: RTCPeerConnection | null = null
  private ws: WebSocket | null = null
  private localStream: MediaStream | null = null
  private audioContainer: HTMLDivElement | null = null

  // Guards a single in-flight offer/answer cycle.
  // After the initial handshake the SERVER drives all renegotiation by
  // sending offers; we never self-initiate again.  This prevents glare.
  private isNegotiating = false

  private callbacks: ManagerCallbacks

  constructor(callbacks: ManagerCallbacks) {
    this.callbacks = callbacks
  }

  setAudioContainer(el: HTMLDivElement | null) {
    this.audioContainer = el
  }

  async startStreaming(token: string, websocketUrl: string): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia not available — use HTTPS or localhost')
    }

    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    })

    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    })

    // Add local mic tracks BEFORE wiring handlers so the server-side
    // AddTransceiverFromKind(recvonly) has something to match against.
    this.localStream.getTracks().forEach((t) => {
      this.pc!.addTrack(t, this.localStream!)
    })

    this.wirePeerHandlers()

    // Open WebSocket — initial offer is sent inside onopen.
    await this.connectWebSocket(token, websocketUrl)
  }

  // ── Peer connection event handlers ─────────────────────────────────────────

  private wirePeerHandlers(): void {
    const pc = this.pc!

    // BUG FIX #1: was 'candidate', server expects 'ice_candidate'
    pc.onicecandidate = ({ candidate }) => {
      if (candidate)
        this.send({ type: 'ice_candidate', candidate: candidate.toJSON() })
    }

    pc.oniceconnectionstatechange = () => {
      const s = pc.iceConnectionState
      if (s === 'failed' || s === 'disconnected') {
        toast.error('ICE connection lost')
      }
    }

    // BUG FIX #4 + #5: audio is managed entirely here via audioContainer.
    // The React hook exposes remoteStreams purely for the participant count UI.
    pc.ontrack = ({ track, streams }) => {
      const stream = streams[0] ?? new MediaStream([track])
      this.playAudio(stream)
      this.callbacks.onTrackReceived(stream)
    }

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState
      this.callbacks.onConnectionStateChange(s as RTCPeerConnectionState)
      if (s === 'failed') {
        toast.error('WebRTC connection failed')
        this.cleanup()
      }
    }

    // BUG FIX #3: remove onnegotiationneeded self-initiation.
    // The Go SFU drives all renegotiation by sending offers to the client
    // when a new track is fanned out.  If the client also self-initiates
    // on negotiationneeded, both sides send offers simultaneously (SDP glare).
    // We only send the very first offer ourselves (in websocket.onopen).
    pc.onnegotiationneeded = null
  }

  // ── WebSocket ───────────────────────────────────────────────────────────────

  private connectWebSocket(token: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${url}?token=${token}`
      this.ws = new WebSocket(wsUrl)

      const timeout = setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket connection timed out'))
        }
      }, 10_000)

      this.ws.onopen = async () => {
        clearTimeout(timeout)
        try {
          // Send the one and only client-initiated offer.
          await this.sendOffer()
          resolve()
        } catch (err) {
          reject(err)
        }
      }

      this.ws.onmessage = async ({ data }) => {
        try {
          await this.handleMessage(JSON.parse(data) as Signal)
        } catch (err) {
          console.error('[SFU] message handling error', err)
        }
      }

      this.ws.onerror = (err) => {
        clearTimeout(timeout)
        console.error('[SFU] WebSocket error', err)
        reject(new Error('WebSocket error'))
      }

      this.ws.onclose = ({ wasClean, code, reason }) => {
        if (!wasClean) toast.error(`Connection closed (${code} ${reason})`)
        this.cleanup()
      }
    })
  }

  // ── Signaling message dispatch ──────────────────────────────────────────────

  private async handleMessage(msg: Signal): Promise<void> {
    const pc = this.pc
    if (!pc) return

    switch (msg.type) {
      // ── Server's answer to our initial offer ────────────────────────────────
      case 'answer':
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: 'answer', sdp: msg.sdp! }),
          )
        }
        break

      // ── BUG FIX #2: server-initiated renegotiation offer ───────────────────
      // When a new speaker joins, the Go SFU adds a track to every other peer's
      // PeerConnection and sends a fresh offer.  We must respond with an answer.
      case 'offer':
        if (this.isNegotiating) return
        this.isNegotiating = true
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: 'offer', sdp: msg.sdp! }),
          )
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          this.send({ type: 'answer', sdp: answer.sdp! })
        } finally {
          this.isNegotiating = false
        }
        break

      // ── BUG FIX #1: server sends 'ice_candidate', not 'candidate' ──────────
      case 'ice_candidate':
        if (msg.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(msg.candidate))
        }
        break

      case 'space_ended':
        toast.info(msg.message ?? 'The host has ended this Space')
        this.callbacks.onSpaceEnded(msg.message ?? '')
        this.cleanup()
        break

      case 'peer_joined':
        this.callbacks.onPeerJoined(msg.peer_id ?? '')
        break

      case 'peer_left':
        this.callbacks.onPeerLeft(msg.peer_id ?? '')
        break

      case 'error':
        toast.error(msg.message ?? 'Server error')
        break

      default:
        console.warn('[SFU] unknown message type:', (msg as any).type)
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private async sendOffer(): Promise<void> {
    const pc = this.pc!
    if (this.isNegotiating || pc.signalingState !== 'stable') return
    this.isNegotiating = true
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      })
      await pc.setLocalDescription(offer)
      this.send({ type: 'offer', sdp: offer.sdp! })
    } finally {
      this.isNegotiating = false
    }
  }

  private send(sig: Signal): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(sig))
    }
  }

  // BUG FIX #4 + #5: single source of truth for audio playback.
  // The component attaches the hook's audioContainerRef to a hidden <div>;
  // this method appends <audio> elements into it.  No duplicate playback.
  private playAudio(stream: MediaStream): void {
    const audio = document.createElement('audio')
    audio.srcObject = stream
    audio.autoplay = true
    audio.setAttribute('playsinline', '')
    audio.id = `remote-audio-${stream.id}`

    if (this.audioContainer) {
      this.audioContainer.appendChild(audio)
    } else {
      // Last-resort fallback — should not happen if the ref is wired correctly
      document.body.appendChild(audio)
      console.warn('[SFU] audioContainer not set — audio appended to body')
    }
  }

  toggleMute(muted: boolean): void {
    this.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !muted
    })
  }

  sendEndSpace(): void {
    this.send({ type: 'end_space' })
  }

  cleanup(): void {
    this.localStream?.getTracks().forEach((t) => t.stop())
    this.localStream = null

    if (this.pc) {
      this.pc.ontrack = null
      this.pc.onicecandidate = null
      this.pc.onconnectionstatechange = null
      this.pc.oniceconnectionstatechange = null
      this.pc.close()
      this.pc = null
    }

    if (this.ws) {
      this.ws.onclose = null // prevent cleanup loop
      this.ws.close()
      this.ws = null
    }

    if (this.audioContainer) this.audioContainer.innerHTML = ''
    this.isNegotiating = false
  }
}

// ─── React hook ──────────────────────────────────────────────────────────────

export const useSpaceStreaming = () => {
  const managerRef = useRef<SpaceStreamManager | null>(null)

  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])

  // BUG FIX #5: this ref is passed to the hidden <div> in the component so
  // SpaceStreamManager always has a valid DOM node for audio elements.
  const audioContainerRef = useRef<HTMLDivElement>(null)

  const startSpace = useCallback(
    async (token: string, websocketUrl: string) => {
      // Tear down any existing session first (e.g. listener rejoining).
      managerRef.current?.cleanup()

      const manager = new SpaceStreamManager({
        onConnectionStateChange: (state) => {
          setIsConnected(state === 'connected')
        },
        onTrackReceived: (stream) => {
          setRemoteStreams((prev) => {
            // Deduplicate by stream id
            if (prev.some((s) => s.id === stream.id)) return prev
            return [...prev, stream]
          })
        },
        onSpaceEnded: () => {
          setIsConnected(false)
          setRemoteStreams([])
          setIsMuted(false)
        },
        onPeerJoined: (_peerId) => {
          // Can be used for participant list UI
        },
        onPeerLeft: (peerId) => {
          setRemoteStreams((prev) => prev.filter((s) => s.id !== peerId))
        },
      })

      // Wire audio container BEFORE startStreaming so the first track has a home.
      manager.setAudioContainer(audioContainerRef.current)
      managerRef.current = manager

      await manager.startStreaming(token, websocketUrl)
    },
    [],
  )

  const stopSpace = useCallback(() => {
    managerRef.current?.cleanup()
    managerRef.current = null
    setIsConnected(false)
    setRemoteStreams([])
    setIsMuted(false)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      managerRef.current?.toggleMute(next)
      return next
    })
  }, [])

  const sendEndSpace = useCallback(() => {
    managerRef.current?.sendEndSpace()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      managerRef.current?.cleanup()
    }
  }, [])

  return {
    startSpace,
    stopSpace,
    toggleMute,
    sendEndSpace,
    isConnected,
    isMuted,
    remoteStreams,
    audioContainerRef, // attach this to a hidden <div> in the component
  }
}
