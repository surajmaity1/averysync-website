import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// ─── Wire protocol (must match Go server domain/models.go) ───────────────────

type MsgType =
  | 'offer'
  | 'answer'
  | 'ice_candidate'
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

// ─── Public connection state machine ─────────────────────────────────────────

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed'

export type TokenProvider = () => string | Promise<string>

interface ManagerCallbacks {
  onStatusChange: (status: ConnectionStatus) => void
  onTrackReceived: (stream: MediaStream) => void
  onSpaceEnded: (message: string) => void
  onPeerJoined: (peerId: string) => void
  onPeerLeft: (peerId: string) => void
}

export interface ManagerOptions {
  maxReconnectAttempts?: number
  baseBackoffMs?: number
  maxBackoffMs?: number
  iceDisconnectGraceMs?: number
  wsConnectTimeoutMs?: number
  /** Upper bound of random jitter added to each reconnect delay (ms). 0 disables. */
  maxJitterMs?: number
}

// Production defaults — keep small so the user feels the recovery, not the outage.
const DEFAULTS: Required<ManagerOptions> = {
  maxReconnectAttempts: 8,
  baseBackoffMs: 1_000,
  maxBackoffMs: 15_000,
  iceDisconnectGraceMs: 4_000,
  wsConnectTimeoutMs: 10_000,
  maxJitterMs: 500,
}

// ─── SpaceStreamManager ──────────────────────────────────────────────────────

export class SpaceStreamManager {
  private pc: RTCPeerConnection | null = null
  private ws: WebSocket | null = null
  private localStream: MediaStream | null = null
  private audioContainer: HTMLDivElement | null = null

  private pendingCandidates: RTCIceCandidateInit[] = []
  private isNegotiating = false

  // Session context — kept across reconnect attempts.
  private tokenProvider: TokenProvider | null = null
  private wsUrl: string | null = null

  // Reconnection bookkeeping.
  private status: ConnectionStatus = 'idle'
  private isStopped = false
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private iceDisconnectTimer: ReturnType<typeof setTimeout> | null = null

  private readonly onOnline = () => this.handleOnline()
  private readonly onVisibilityChange = () => this.handleVisibilityChange()

  private readonly opts: Required<ManagerOptions>

  constructor(
    private readonly callbacks: ManagerCallbacks,
    options: ManagerOptions = {},
  ) {
    this.opts = { ...DEFAULTS, ...options }
  }

  setAudioContainer(el: HTMLDivElement | null) {
    this.audioContainer = el
  }

  async start(
    tokenProvider: TokenProvider,
    websocketUrl: string,
  ): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia not available — use HTTPS or localhost')
    }

    this.tokenProvider = tokenProvider
    this.wsUrl = websocketUrl
    this.isStopped = false
    this.reconnectAttempts = 0

    this.attachLifecycleListeners()
    await this.acquireLocalStream()
    await this.connect()
  }

  // ── Lifecycle (visibility / online) ────────────────────────────────────────

  private attachLifecycleListeners(): void {
    window.addEventListener('online', this.onOnline)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  }

  private detachLifecycleListeners(): void {
    window.removeEventListener('online', this.onOnline)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  }

  private handleOnline(): void {
    if (this.isStopped || this.status === 'connected') return
    // Network just returned — collapse backoff and retry now.
    this.reconnectAttempts = Math.min(this.reconnectAttempts, 1)
    this.clearReconnectTimer()
    void this.reconnect()
  }

  private handleVisibilityChange(): void {
    if (this.isStopped) return
    if (document.visibilityState !== 'visible') return
    if (this.status === 'connected' || this.status === 'failed') return
    // User returned to the tab — short-circuit any pending backoff.
    if (this.reconnectTimer) {
      this.clearReconnectTimer()
      void this.reconnect()
    }
  }

  // ── Local media ────────────────────────────────────────────────────────────

  private async acquireLocalStream(): Promise<void> {
    const stillAlive =
      this.localStream?.getTracks().every((t) => t.readyState === 'live') ??
      false
    if (this.localStream && stillAlive) return

    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    })
  }

  // ── Connect / reconnect ────────────────────────────────────────────────────

  private async connect(): Promise<void> {
    if (this.isStopped) return

    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting')

    // Mic may have been released by the OS while backgrounded — re-acquire if so.
    await this.acquireLocalStream()
    this.createPeerConnection()

    const token = await this.tokenProvider!()
    if (!token) throw new Error('No token available for connection')

    await this.openWebSocket(token, this.wsUrl!)
  }

  private createPeerConnection(): void {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    })
    this.pc = pc

    this.localStream!.getTracks().forEach((t) => {
      pc.addTrack(t, this.localStream!)
    })

    pc.onicecandidate = ({ candidate }) => {
      if (candidate)
        this.send({ type: 'ice_candidate', candidate: candidate.toJSON() })
    }

    pc.oniceconnectionstatechange = () => {
      const s = pc.iceConnectionState
      if (s === 'disconnected') {
        // Transient by spec — give it a window to recover before tearing down.
        this.clearIceDisconnectTimer()
        this.iceDisconnectTimer = setTimeout(() => {
          if (pc.iceConnectionState === 'disconnected') {
            this.handleConnectionLost('ice-disconnected')
          }
        }, this.opts.iceDisconnectGraceMs)
      } else if (s === 'failed') {
        this.handleConnectionLost('ice-failed')
      } else if (s === 'connected' || s === 'completed') {
        this.clearIceDisconnectTimer()
      }
    }

    pc.ontrack = ({ track, streams }) => {
      const stream = streams[0] ?? new MediaStream([track])
      this.playAudio(stream)
      this.callbacks.onTrackReceived(stream)
    }

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState
      if (s === 'connected') {
        this.reconnectAttempts = 0
        this.setStatus('connected')
      } else if (s === 'failed') {
        this.handleConnectionLost('pc-failed')
      }
    }

    // Server drives every renegotiation past the initial offer — never
    // self-initiate or we hit SDP glare.
    pc.onnegotiationneeded = null
  }

  private openWebSocket(token: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${url}?token=${encodeURIComponent(token)}`)
      this.ws = ws

      const timeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          try {
            ws.close()
          } catch {
            // ignore
          }
          reject(new Error('WebSocket connection timed out'))
        }
      }, this.opts.wsConnectTimeoutMs)

      ws.onopen = async () => {
        clearTimeout(timeout)
        try {
          await this.sendOffer()
          resolve()
        } catch (err) {
          reject(err)
        }
      }

      ws.onmessage = async ({ data }) => {
        try {
          await this.handleMessage(JSON.parse(data) as Signal)
        } catch (err) {
          console.error('[SFU] message handling error', err)
        }
      }

      ws.onerror = (err) => {
        clearTimeout(timeout)
        console.error('[SFU] WebSocket error', err)
      }

      ws.onclose = ({ wasClean, code }) => {
        clearTimeout(timeout)
        if (this.isStopped) return
        this.handleConnectionLost(`ws-closed code=${code} clean=${wasClean}`)
      }
    })
  }

  private handleConnectionLost(reason: string): void {
    if (this.isStopped) return
    // Already retrying — don't pile up parallel reconnect loops.
    if (this.status === 'reconnecting' && this.reconnectTimer) return

    console.warn(`[SFU] connection lost: ${reason}`)
    this.tearDownPeerAndSocket()
    this.scheduleReconnect()
  }

  private scheduleReconnect(): void {
    if (this.isStopped) return

    if (this.reconnectAttempts >= this.opts.maxReconnectAttempts) {
      toast.error('Unable to reconnect to the space')
      this.setStatus('failed')
      return
    }

    const backoff = Math.min(
      this.opts.baseBackoffMs * 2 ** this.reconnectAttempts,
      this.opts.maxBackoffMs,
    )
    // Jitter avoids thundering herd; tests set maxJitterMs:0 for determinism.
    const delay =
      backoff +
      (this.opts.maxJitterMs > 0 ? Math.random() * this.opts.maxJitterMs : 0)
    this.reconnectAttempts += 1
    this.setStatus('reconnecting')

    this.clearReconnectTimer()
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      void this.reconnect()
    }, delay)
  }

  private async reconnect(): Promise<void> {
    if (this.isStopped) return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      // Wait for the 'online' event rather than burning attempts offline.
      return
    }

    try {
      await this.connect()
    } catch (err) {
      console.error('[SFU] reconnect attempt failed', err)
      this.tearDownPeerAndSocket()
      this.scheduleReconnect()
    }
  }

  // ── Signaling ──────────────────────────────────────────────────────────────

  private async drainPendingCandidates(): Promise<void> {
    const pc = this.pc
    if (!pc) return
    const queued = this.pendingCandidates.splice(0)
    for (const init of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(init))
      } catch (err) {
        console.warn('[SFU] drainPendingCandidates error', err)
      }
    }
  }

  private async handleMessage(msg: Signal): Promise<void> {
    const pc = this.pc
    if (!pc) return

    switch (msg.type) {
      case 'answer':
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: 'answer', sdp: msg.sdp! }),
          )
          await this.drainPendingCandidates()
        }
        break

      case 'offer':
        if (this.isNegotiating) return
        this.isNegotiating = true
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: 'offer', sdp: msg.sdp! }),
          )
          await this.drainPendingCandidates()
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          this.send({ type: 'answer', sdp: answer.sdp! })
        } finally {
          this.isNegotiating = false
        }
        break

      case 'ice_candidate':
        if (msg.candidate) {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate))
          } else {
            this.pendingCandidates.push(msg.candidate)
          }
        }
        break

      case 'space_ended':
        toast.info(msg.message ?? 'The host has ended this Space')
        this.callbacks.onSpaceEnded(msg.message ?? '')
        this.stop()
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
        console.warn(
          '[SFU] unknown message type:',
          (msg as { type: string }).type,
        )
    }
  }

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

  // ── Audio sink ─────────────────────────────────────────────────────────────

  private playAudio(stream: MediaStream): void {
    const id = `remote-audio-${stream.id}`
    // Reconnects re-deliver the same remote stream; avoid duplicate <audio>.
    if (this.audioContainer?.querySelector(`#${CSS.escape(id)}`)) return

    const audio = document.createElement('audio')
    audio.srcObject = stream
    audio.autoplay = true
    audio.setAttribute('playsinline', '')
    audio.id = id

    if (this.audioContainer) {
      this.audioContainer.appendChild(audio)
    } else {
      document.body.appendChild(audio)
      console.warn('[SFU] audioContainer not set — audio appended to body')
    }
  }

  // ── Controls ───────────────────────────────────────────────────────────────

  toggleMute(muted: boolean): void {
    this.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !muted
    })
  }

  /** Returns the local mic track's enabled flag, or null when no track. */
  getMicEnabled(): boolean | null {
    const track = this.localStream?.getAudioTracks()[0]
    return track ? track.enabled : null
  }

  sendEndSpace(): void {
    this.send({ type: 'end_space' })
  }

  // ── Teardown ───────────────────────────────────────────────────────────────

  private setStatus(status: ConnectionStatus): void {
    if (this.status === status) return
    this.status = status
    this.callbacks.onStatusChange(status)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private clearIceDisconnectTimer(): void {
    if (this.iceDisconnectTimer) {
      clearTimeout(this.iceDisconnectTimer)
      this.iceDisconnectTimer = null
    }
  }

  // Closes peer + socket without releasing the mic or stopping the manager,
  // so a reconnect attempt can reuse the existing local stream.
  private tearDownPeerAndSocket(): void {
    this.clearIceDisconnectTimer()
    this.pendingCandidates = []
    this.isNegotiating = false

    if (this.pc) {
      this.pc.ontrack = null
      this.pc.onicecandidate = null
      this.pc.onconnectionstatechange = null
      this.pc.oniceconnectionstatechange = null
      this.pc.onnegotiationneeded = null
      try {
        this.pc.close()
      } catch {
        // ignore
      }
      this.pc = null
    }

    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onerror = null
      this.ws.onclose = null
      try {
        this.ws.close()
      } catch {
        // ignore
      }
      this.ws = null
    }

    if (this.audioContainer) this.audioContainer.innerHTML = ''
  }

  // Full intentional stop — user left, host ended, or component unmounted.
  stop(): void {
    if (this.isStopped) return
    this.isStopped = true
    this.detachLifecycleListeners()
    this.clearReconnectTimer()
    this.tearDownPeerAndSocket()

    this.localStream?.getTracks().forEach((t) => t.stop())
    this.localStream = null

    this.tokenProvider = null
    this.wsUrl = null
    this.reconnectAttempts = 0
    this.setStatus('idle')
  }
}

// ─── React hook ──────────────────────────────────────────────────────────────

export const useSpaceStreaming = () => {
  const managerRef = useRef<SpaceStreamManager | null>(null)

  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])

  const audioContainerRef = useRef<HTMLDivElement>(null)

  const startSpace = useCallback(
    async (tokenOrProvider: string | TokenProvider, websocketUrl: string) => {
      // Hard reset any prior session before starting a new one.
      managerRef.current?.stop()

      const tokenProvider: TokenProvider =
        typeof tokenOrProvider === 'function'
          ? tokenOrProvider
          : () => tokenOrProvider

      const manager = new SpaceStreamManager({
        onStatusChange: setStatus,
        onTrackReceived: (stream) => {
          setRemoteStreams((prev) =>
            prev.some((s) => s.id === stream.id) ? prev : [...prev, stream],
          )
        },
        onSpaceEnded: () => {
          setRemoteStreams([])
          setIsMuted(false)
        },
        onPeerJoined: () => {
          // Reserved for future participant-list UI.
        },
        onPeerLeft: (peerId) => {
          setRemoteStreams((prev) => prev.filter((s) => s.id !== peerId))
        },
      })

      manager.setAudioContainer(audioContainerRef.current)
      managerRef.current = manager

      await manager.start(tokenProvider, websocketUrl)
    },
    [],
  )

  const stopSpace = useCallback(() => {
    managerRef.current?.stop()
    managerRef.current = null
    setRemoteStreams([])
    setIsMuted(false)
    setStatus('idle')
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

  useEffect(() => {
    return () => {
      managerRef.current?.stop()
      managerRef.current = null
    }
  }, [])

  return {
    startSpace,
    stopSpace,
    toggleMute,
    sendEndSpace,
    status,
    isConnected: status === 'connected',
    isReconnecting: status === 'reconnecting',
    isMuted,
    remoteStreams,
    audioContainerRef,
  }
}
