// hooks/useSpaceStreaming.ts
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface WebRTCConfig {
  token: string
  websocketUrl: string
}

class SpaceStreamManager {
  private peerConnection: RTCPeerConnection | null = null
  private websocket: WebSocket | null = null
  private localStream: MediaStream | null = null
  private isNegotiating = false
  private onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  private onTrackReceived?: (stream: MediaStream) => void
  private audioRef: HTMLDivElement | null = null

  constructor(
    config: WebRTCConfig,
    callbacks?: {
      onConnectionStateChange?: (state: RTCPeerConnectionState) => void
      onTrackReceived?: (stream: MediaStream) => void
    },
  ) {
    this.onConnectionStateChange = callbacks?.onConnectionStateChange
    this.onTrackReceived = callbacks?.onTrackReceived
  }

  setAudioContainer(ref: HTMLDivElement | null) {
    this.audioRef = ref
  }

  async startStreaming(token: string, websocketUrl: string): Promise<void> {
    try {
      // Check media device support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error(
          'Camera/Mic API is blocked. Access via HTTPS or localhost required.',
        )
        throw new Error('Media devices not supported')
      }

      // console.log('Requesting microphone access...')

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })

      // console.log('✓ Microphone access granted:', this.localStream.id)

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      })

      // console.log('✓ Peer connection created')

      // Add local tracks
      this.localStream.getTracks().forEach((track) => {
        // console.log(`Adding track: ${track.label} (${track.kind})`)
        this.peerConnection!.addTrack(track, this.localStream!)
      })

      // Setup handlers
      this.setupPeerConnectionHandlers()

      // Connect WebSocket
      await this.connectWebSocket(token, websocketUrl)

      // console.log('✓ Space streaming started successfully')
    } catch (error) {
      console.error('Failed to start streaming:', error)
      toast.error(
        'Failed to start streaming. Check your microphone permissions.',
      )
      this.cleanup()
      throw error
    }
  }

  private setupPeerConnectionHandlers(): void {
    if (!this.peerConnection) return

    // ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.websocket?.readyState === WebSocket.OPEN) {
        // console.log('→ Sending ICE candidate')
        this.websocket.send(
          JSON.stringify({
            type: 'candidate',
            candidate: event.candidate.toJSON(),
          }),
        )
      }
    }

    // ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState
      // console.log('ICE connection state:', state)

      if (state === 'failed' || state === 'disconnected') {
        toast.error('Connection lost. Attempting to reconnect...')
      } else if (state === 'connected') {
        // console.log('✓ ICE connected')
      }
    }

    // Remote tracks
    this.peerConnection.ontrack = (event) => {
      // console.log(`← Remote track received: ${event.track.kind}`)

      const [remoteStream] = event.streams
      if (remoteStream) {
        this.playRemoteStream(remoteStream)
        this.onTrackReceived?.(remoteStream)
      }
    }

    // Connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      // console.log('Peer connection state:', state)

      if (state) {
        this.onConnectionStateChange?.(state as RTCPeerConnectionState)
      }

      if (state === 'connected') {
        toast.success('Connected to space')
      } else if (state === 'failed') {
        toast.error('Connection failed')
        this.cleanup()
      }
    }

    // Negotiation needed
    this.peerConnection.onnegotiationneeded = async () => {
      // console.log('Negotiation needed')

      if (
        this.isNegotiating ||
        this.peerConnection?.signalingState !== 'stable'
      ) {
        // console.log('Already negotiating, skipping...')
        return
      }

      try {
        this.isNegotiating = true
        await this.createAndSendOffer()
      } finally {
        this.isNegotiating = false
      }
    }
  }

  private async connectWebSocket(
    token: string,
    websocketUrl: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${websocketUrl}?token=${token}`
      // console.log('Connecting to WebSocket:', wsUrl)

      this.websocket = new WebSocket(wsUrl)

      this.websocket.onopen = async () => {
        // console.log('✓ WebSocket connected')
        try {
          await this.createAndSendOffer()
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      this.websocket.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data)
          // console.log('← WebSocket message:', msg.type)
          await this.handleWebSocketMessage(msg)
        } catch (error) {
          console.error('Error handling message:', error)
        }
      }

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        toast.error('WebSocket connection error')
        reject(error)
      }

      this.websocket.onclose = (event) => {
        // console.log('WebSocket closed:', event.code, event.reason)
        if (!event.wasClean) {
          toast.error('Connection lost')
        }
        this.cleanup()
      }

      // Connection timeout
      setTimeout(() => {
        if (this.websocket?.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket connection timeout'))
        }
      }, 10000)
    })
  }

  private async createAndSendOffer(): Promise<void> {
    if (!this.peerConnection || !this.websocket) {
      throw new Error('Peer connection or WebSocket not initialized')
    }

    // console.log('→ Creating offer...')
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    })

    // console.log('→ Setting local description...')
    await this.peerConnection.setLocalDescription(offer)

    if (this.websocket.readyState === WebSocket.OPEN) {
      // console.log('→ Sending offer via WebSocket')
      this.websocket.send(
        JSON.stringify({
          type: 'offer',
          sdp: offer.sdp,
        }),
      )
    }
  }

  private async handleWebSocketMessage(msg: any): Promise<void> {
    if (!this.peerConnection) return

    switch (msg.type) {
      case 'answer':
        // console.log('← Processing answer...')
        // An answer should only be set if the connection is in a state that expects one.
        if (this.peerConnection.signalingState === 'have-local-offer') {
          try {
            await this.peerConnection.setRemoteDescription(
              new RTCSessionDescription({
                type: 'answer',
                sdp: msg.sdp,
              }),
            )
            // console.log('✓ Remote description set')
          } catch (error) {
            console.error('Error setting remote description:', error)
          }
        }
        break

      case 'candidate':
        // console.log('← Received ICE candidate')
        try {
          if (msg.candidate) {
            await this.peerConnection.addIceCandidate(
              new RTCIceCandidate(msg.candidate),
            )
          }
        } catch (error) {
          console.error('Error adding ICE candidate:', error)
        }
        break

      case 'negotiate':
        // console.log('← Renegotiation requested')
        if (
          this.peerConnection.signalingState === 'stable' &&
          !this.isNegotiating
        ) {
          this.isNegotiating = true
          try {
            await this.createAndSendOffer()
          } finally {
            this.isNegotiating = false
          }
        }
        break

      default:
        console.warn('Unknown message type:', msg.type)
    }
  }

  private playRemoteStream(stream: MediaStream): void {
    if (!this.audioRef) {
      console.warn('Audio container not set, creating audio element in body')
      const audio = document.createElement('audio')
      audio.srcObject = stream
      audio.autoplay = true
      document.body.appendChild(audio)
      return
    }

    const audio = document.createElement('audio')
    audio.srcObject = stream
    audio.autoplay = true
    audio.id = `remote-audio-${stream.id}`
    this.audioRef.appendChild(audio)
    // console.log('✓ Playing remote stream')
  }

  toggleMute(muted: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted
      })
      // console.log(`Audio ${muted ? 'muted' : 'unmuted'}`)
    }
  }

  cleanup(): void {
    // console.log('Cleaning up WebRTC connection...')

    // Stop local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
        // console.log(`Stopped track: ${track.label}`)
      })
      this.localStream = null
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Close WebSocket
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }

    // Clear audio elements
    if (this.audioRef) {
      this.audioRef.innerHTML = ''
    }

    this.isNegotiating = false
    // console.log('✓ Cleanup complete')
  }

  async getStats(): Promise<RTCStatsReport | null> {
    return this.peerConnection ? await this.peerConnection.getStats() : null
  }
}

// React Hook
export const useSpaceStreaming = () => {
  const [streamManager, setStreamManager] = useState<SpaceStreamManager | null>(
    null,
  )
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])
  const audioContainerRef = useRef<HTMLDivElement>(null)

  const startSpace = async (token: string, websocketUrl: string) => {
    try {
      const manager = new SpaceStreamManager(
        { token, websocketUrl },
        {
          onConnectionStateChange: (state) => {
            setIsConnected(state === 'connected')
          },
          onTrackReceived: (stream) => {
            setRemoteStreams((prev) => [...prev, stream])
          },
        },
      )

      if (audioContainerRef.current) {
        manager.setAudioContainer(audioContainerRef.current)
      }

      await manager.startStreaming(token, websocketUrl)
      setStreamManager(manager)
      toast.success('Joined space successfully')
    } catch (error) {
      console.error('Failed to start space:', error)
      toast.error('Failed to join space')
      throw error
    }
  }

  const stopSpace = () => {
    if (streamManager) {
      streamManager.cleanup()
      setStreamManager(null)
      setIsConnected(false)
      setRemoteStreams([])
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (streamManager) {
      const newMutedState = !isMuted
      streamManager.toggleMute(newMutedState)
      setIsMuted(newMutedState)
    }
  }

  useEffect(() => {
    return () => {
      if (streamManager) {
        streamManager.cleanup()
      }
    }
  }, [streamManager])

  return {
    startSpace,
    stopSpace,
    toggleMute,
    isConnected,
    isMuted,
    remoteStreams,
    audioContainerRef,
  }
}
