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
  | 'mic_state'
  | 'reaction'
  | 'request_mic'
  | 'approve_mic'
  | 'deny_mic'
  | 'mute_peer'
  | 'remove_peer'
  | 'block_peer'
  | 'error'

/** Host-only moderation commands, relayed by the server to the target peer. */
export type ModerationAction = 'mute_peer' | 'remove_peer' | 'block_peer'

interface Signal {
  type: MsgType
  sdp?: string
  candidate?: RTCIceCandidateInit
  peer_id?: string
  message?: string
  /** mic_state payload */
  muted?: boolean
  /** reaction payload */
  emoji?: string
}

// ─── Public connection state machine ─────────────────────────────────────────

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed'

export type TokenProvider = () => string | Promise<string>

export interface ManagerCallbacks {
  onStatusChange: (status: ConnectionStatus) => void
  onTrackReceived: (stream: MediaStream) => void
  onSpaceEnded: (message: string) => void
  onPeerJoined: (peerId: string) => void
  onPeerLeft: (peerId: string) => void
  onPeerMicChange: (peerId: string, muted: boolean) => void
  onPeerReaction: (peerId: string, emoji: string) => void
  /** A listener asked to speak (hosts/cohosts act on it; others ignore). */
  onMicRequest: (peerId: string) => void
  /** The host granted THIS client the mic. Manager is already upgrading. */
  onMicApproved: () => void
  /** The host declined THIS client's mic request. */
  onMicDenied: () => void
  /** The host force-muted this client. Local track is already disabled. */
  onForceMuted: () => void
  /** The host removed or blocked this client. Manager stops itself after. */
  onRemoved: (message: string) => void
}

export interface ManagerOptions {
  maxReconnectAttempts?: number
  baseBackoffMs?: number
  maxBackoffMs?: number
  iceDisconnectGraceMs?: number
  wsConnectTimeoutMs?: number
  /** Upper bound of random jitter added to each reconnect delay (ms). 0 disables. */
  maxJitterMs?: number
  /**
   * Hold a screen Wake Lock for the duration of the session so a phone doesn't
   * auto-lock (and suspend the page + mic) mid-broadcast. Intended for hosts;
   * listeners don't need to keep the screen lit. Best-effort — silently a no-op
   * where the API is unavailable.
   */
  keepScreenAwake?: boolean
  /**
   * Join with the microphone disabled. The track is still captured (so
   * unmuting is instant and permission is requested up front) but starts
   * with enabled=false, and the initial mic_state announces muted.
   */
  startMuted?: boolean
  /**
   * Capture and publish the local microphone. When false the session is
   * receive-only: no getUserMedia call (so no permission prompt), no local
   * track on the peer connection, and toggleMute can never unmute.
   * For listeners — only hosts/cohosts may speak.
   */
  sendAudio?: boolean
}

// Production defaults — keep small so the user feels the recovery, not the outage.
const DEFAULTS: Required<ManagerOptions> = {
  maxReconnectAttempts: 8,
  baseBackoffMs: 1_000,
  maxBackoffMs: 15_000,
  iceDisconnectGraceMs: 4_000,
  wsConnectTimeoutMs: 10_000,
  maxJitterMs: 500,
  keepScreenAwake: false,
  startMuted: false,
  sendAudio: true,
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

  // Screen wake lock held while hosting (see ManagerOptions.keepScreenAwake).
  private wakeLock: WakeLockSentinel | null = null

  // Desired mic state. Owned here (not derived from the track) so a reconnect
  // that re-acquires the mic re-applies it instead of coming back unmuted.
  private muted = false

  private readonly onOnline = () => this.handleOnline()
  private readonly onVisibilityChange = () => this.handleVisibilityChange()

  private readonly opts: Required<ManagerOptions>

  constructor(
    private readonly callbacks: ManagerCallbacks,
    options: ManagerOptions = {},
  ) {
    this.opts = { ...DEFAULTS, ...options }
    // A receive-only session has no publishable audio, so it is muted by
    // definition and stays that way (toggleMute refuses to unmute).
    this.muted = this.opts.startMuted || !this.opts.sendAudio
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
    void this.acquireWakeLock()
    await this.acquireLocalStream()
    await this.connect()
  }

  // ── Screen wake lock ─────────────────────────────────────────────────────────

  private async acquireWakeLock(): Promise<void> {
    if (!this.opts.keepScreenAwake || this.wakeLock) return
    if (typeof navigator === 'undefined' || !navigator.wakeLock) return
    // A lock can only be taken while the page is visible; the visibility
    // handler re-acquires when the user returns (locks auto-release on hide).
    if (
      typeof document !== 'undefined' &&
      document.visibilityState !== 'visible'
    )
      return

    try {
      const sentinel = await navigator.wakeLock.request('screen')
      // Guard against a stop()/release() that raced with this async request.
      if (this.isStopped) {
        void sentinel.release().catch(() => {})
        return
      }
      this.wakeLock = sentinel
      sentinel.addEventListener('release', () => {
        if (this.wakeLock === sentinel) this.wakeLock = null
      })
    } catch (err) {
      console.warn('[SFU] wake lock request failed', err)
    }
  }

  private releaseWakeLock(): void {
    const sentinel = this.wakeLock
    this.wakeLock = null
    if (sentinel) {
      try {
        void sentinel.release().catch(() => {})
      } catch {
        // ignore
      }
    }
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
    // The OS auto-releases a wake lock while the page is hidden — re-take it
    // the moment the host returns, regardless of connection state.
    void this.acquireWakeLock()
    if (this.status === 'connected') return
    // The user is back and expects the space to come back with them: restore
    // the attempt budget and retry now instead of waiting out the backoff.
    // 'failed' recovers too — whatever exhausted the budget (an outage, an
    // OS-suspended tab) is worth one fresh round now that they're watching.
    this.reconnectAttempts = Math.min(this.reconnectAttempts, 1)
    if (this.status === 'failed' || this.reconnectTimer) {
      this.clearReconnectTimer()
      void this.reconnect()
    }
  }

  // ── Local media ────────────────────────────────────────────────────────────

  private async acquireLocalStream(): Promise<void> {
    // Listeners are receive-only: never touch the microphone.
    if (!this.opts.sendAudio) return

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

    // Apply the desired mute state to the fresh track (initial join and any
    // reconnect that had to re-acquire the mic).
    this.localStream.getAudioTracks().forEach((t) => {
      t.enabled = !this.muted
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

    this.localStream?.getTracks().forEach((t) => {
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
        // Late joiners have no history of our toggles — announce current state.
        // `muted` (not the track flag) so receive-only sessions report muted.
        this.send({ type: 'mic_state', muted: this.muted })
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
      const ws = new WebSocket(url, ['jwt', token])
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

    // A hidden tab must never exhaust the attempt budget: browsers throttle
    // background timers and drop sockets while minimized, so counting those
    // attempts would strand the user on 'failed' before they even return.
    // Instead retry forever on the capped cadence; the visibility handler
    // takes over (fresh budget, immediate retry) the moment they come back.
    const hidden =
      typeof document !== 'undefined' && document.visibilityState === 'hidden'

    if (!hidden && this.reconnectAttempts >= this.opts.maxReconnectAttempts) {
      toast.error('Unable to reconnect to the space')
      this.setStatus('failed')
      return
    }

    const backoff = hidden
      ? this.opts.maxBackoffMs
      : Math.min(
          this.opts.baseBackoffMs * 2 ** this.reconnectAttempts,
          this.opts.maxBackoffMs,
        )
    // Jitter avoids thundering herd; tests set maxJitterMs:0 for determinism.
    const delay =
      backoff +
      (this.opts.maxJitterMs > 0 ? Math.random() * this.opts.maxJitterMs : 0)
    if (!hidden) this.reconnectAttempts += 1
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
        // The server only broadcasts NEW joins — a late joiner never hears
        // about peers already in the room. Re-announcing our mic state on
        // every join makes the server's mic_state broadcast (stamped with our
        // peer_id) reach the newcomer, whose session store infers our
        // presence from it. One tiny message per join, and idempotent on the
        // receiving side.
        this.send({ type: 'mic_state', muted: this.muted })
        break

      case 'peer_left':
        this.callbacks.onPeerLeft(msg.peer_id ?? '')
        break

      case 'mic_state':
        if (msg.peer_id) {
          this.callbacks.onPeerMicChange(msg.peer_id, msg.muted ?? false)
        }
        break

      case 'reaction':
        if (msg.peer_id && msg.emoji) {
          this.callbacks.onPeerReaction(msg.peer_id, msg.emoji)
        }
        break

      case 'request_mic':
        if (msg.peer_id) this.callbacks.onMicRequest(msg.peer_id)
        break

      // Relayed only to the requester, so receiving one means "you".
      case 'approve_mic':
        toast.success(
          msg.message ?? 'The host gave you the mic — unmute to speak',
        )
        this.enableSpeaking()
        this.callbacks.onMicApproved()
        break

      case 'deny_mic':
        toast.info(msg.message ?? 'The host declined your request to speak')
        this.callbacks.onMicDenied()
        break

      // Moderation signals are relayed only to the target peer, so receiving
      // one always means "this client is the target".
      case 'mute_peer':
        this.toggleMute(true)
        this.send({ type: 'mic_state', muted: true })
        toast.info(msg.message ?? 'The host muted your microphone')
        this.callbacks.onForceMuted()
        break

      case 'remove_peer':
      case 'block_peer': {
        const fallback =
          msg.type === 'block_peer'
            ? 'The host blocked you from this Space'
            : 'The host removed you from this Space'
        toast.error(msg.message ?? fallback)
        this.callbacks.onRemoved(msg.message ?? fallback)
        this.stop()
        break
      }

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
    // A receive-only session has nothing to unmute — speaking is host/cohost only.
    if (!this.opts.sendAudio && !muted) return

    this.muted = muted
    this.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !muted
    })
    this.send({ type: 'mic_state', muted })
  }

  /** Returns the local mic track's enabled flag, or null when no track. */
  getMicEnabled(): boolean | null {
    const track = this.localStream?.getAudioTracks()[0]
    return track ? track.enabled : null
  }

  /** The local microphone stream, or null for receive-only sessions. */
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  /** Listener: ask the hosts for the mic. */
  sendMicRequest(): void {
    this.send({ type: 'request_mic' })
  }

  /** Host/cohost: grant or decline a listener's mic request. */
  sendMicApproval(peerId: string, approved: boolean): void {
    this.send({ type: approved ? 'approve_mic' : 'deny_mic', peer_id: peerId })
  }

  /**
   * Upgrade a receive-only session to a publishing one (mic approved).
   * The server owns renegotiation, so a mid-connection addTrack would glare —
   * instead reuse the reconnect machinery: tear down and rebuild the peer
   * connection, which now captures and offers the mic. Stays muted; the user
   * unmutes explicitly.
   */
  private enableSpeaking(): void {
    if (this.opts.sendAudio) return
    this.opts.sendAudio = true
    // Speakers keep the screen awake so the OS can't suspend the mic.
    this.opts.keepScreenAwake = true
    void this.acquireWakeLock()

    this.tearDownPeerAndSocket()
    void this.reconnect()
  }

  sendEndSpace(): void {
    this.send({ type: 'end_space' })
  }

  sendReaction(emoji: string): void {
    this.send({ type: 'reaction', emoji })
  }

  sendModeration(action: ModerationAction, peerId: string): void {
    this.send({ type: action, peer_id: peerId })
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
    this.releaseWakeLock()
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
