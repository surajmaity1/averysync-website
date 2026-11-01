import { useSyncExternalStore } from 'react'
import {
  SpaceStreamManager,
  type ConnectionStatus,
  type ManagerCallbacks,
  type ManagerOptions,
  type ModerationAction,
  type TokenProvider,
} from './stream'

// ─── Why this store exists ────────────────────────────────────────────────────
//
// A live space must outlive any single view. When the session lived inside the
// space dialog, closing the popup (or a listener navigating away) unmounted the
// component and tore the WebRTC session down — the host's space died the moment
// they hid the modal.
//
// The fix: own the session in one app-level singleton. React components are
// dumb subscribers via useSyncExternalStore, so a view unmounting merely
// unsubscribes — it can never stop the session. The session ends only on
// explicit intent (leave/endSpace) or a server signal (space_ended / removed).

/** The subset of SpaceStreamManager the store drives. Lets tests inject a fake. */
export interface ISpaceManager {
  setAudioContainer(el: HTMLDivElement | null): void
  start(tokenProvider: TokenProvider, wsUrl: string): Promise<void>
  stop(): void
  toggleMute(muted: boolean): void
  getMicEnabled(): boolean | null
  getLocalStream(): MediaStream | null
  sendEndSpace(): void
  sendReaction(emoji: string): void
  sendModeration(action: ModerationAction, peerId: string): void
  sendMicRequest(): void
  sendMicApproval(peerId: string, approved: boolean): void
  /** Preflight browser mic permission (may prompt). True when granted. */
  ensureMicAccess(): Promise<boolean>
}

export type ManagerFactory = (
  callbacks: ManagerCallbacks,
  options?: ManagerOptions,
) => ISpaceManager

export type SpaceRole = 'host' | 'cohost' | 'listener'

/** Only hosts and cohosts may publish audio; listeners are receive-only. */
export const roleCanSpeak = (role: SpaceRole | null): boolean =>
  role === 'host' || role === 'cohost'

/**
 * Only hosts and cohosts moderate mic requests (see and answer them). This is
 * deliberately a ROLE check, never `canSpeak`: an approved listener gains the
 * ability to speak, but the role stays 'listener' — speaking rights must not
 * leak into moderation rights.
 */
export const roleCanModerate = (role: SpaceRole | null): boolean =>
  role === 'host' || role === 'cohost'

export interface SpaceSessionSnapshot {
  /** The post whose space is currently active, or null when idle. */
  activePostId: string | null
  postTitle: string | null
  role: SpaceRole | null
  status: ConnectionStatus
  isMuted: boolean
  /**
   * Whether a HOST muted this client (vs. the user muting their own mic). A
   * force-mute locks the user's own mute control — only the host may lift it —
   * so the user cannot simply unmute past a moderation action. Set by the
   * force-mute wire signal and by the roster reconcile; cleared when the roster
   * shows the host has lifted the mute.
   */
  isForceMuted: boolean
  /**
   * Whether this session may publish audio. True for hosts/cohosts from the
   * start, and for listeners once a host approves their mic request.
   */
  canSpeak: boolean
  /** This listener sent a mic request and is awaiting the host's answer. */
  hasRequestedMic: boolean
  /**
   * Whether the host is currently connected to the space. Presumed true when
   * a session starts (a live space implies its host), then driven in real time
   * by the host's own peer_left / peer_joined broadcasts, so every listener's
   * participant UI drops the host the moment their connection goes — and shows
   * them again if they rejoin. Trivially true on the host's own session.
   */
  isHostPresent: boolean
  /** Pending mic requests (peer ids), maintained on host/cohost sessions. */
  micRequests: string[]
  peerIds: string[]
  /** peerId → muted. Absent peers are treated as live. */
  peerMicStates: Record<string, boolean>
  /**
   * Peers whose host mute/unmute is in flight (the authoritative PATCH has not
   * settled yet). Their mic badge shows a loading skeleton instead of a mic
   * state, so the host never sees an eager muted/unmuted flip before the
   * backend confirms it.
   */
  moderationPendingPeerIds: string[]
  /** peerId → emoji currently popping on that peer's avatar. */
  reactions: Record<string, string>
  remoteStreams: MediaStream[]
  /**
   * Whether the active space's dialog should be showing. Lives here — not in
   * a feed card — because reopening a minimized space must work from the
   * persistent bar, which is mounted at the app root and has no access to any
   * card's local state. False whenever no session is active.
   */
  isDialogOpen: boolean
  /**
   * Posts whose spaces are known to have ended, remembered across session
   * resets. A space in here can never be (re)joined — start() refuses it —
   * which is what keeps a stale "live" post cache from letting users join a
   * space the host already closed.
   */
  endedSpaceIds: string[]
}

export interface StartArgs {
  postId: string
  postTitle: string
  role: SpaceRole
  /** The space host's user id (peer events carry user ids) — presence tracking. */
  hostId: string
  /** A raw token or a provider invoked on every (re)connection attempt. */
  tokenProvider: string | TokenProvider
  wsUrl: string
}

export interface SpaceSessionStore {
  subscribe(listener: () => void): () => void
  getSnapshot(): SpaceSessionSnapshot
  /** Persistent audio sink, mounted once at the app root (survives modals). */
  attachAudioContainer(el: HTMLDivElement | null): void
  /**
   * The local mic stream (for the self audio-level meter). An accessor, not
   * snapshot state — the stream object mutates internally and views re-render
   * on status changes anyway.
   */
  getLocalStream(): MediaStream | null
  start(args: StartArgs): Promise<void>
  toggleMute(): void
  /**
   * Reconcile THIS client's own mute against the authoritative roster
   * (docs/03 §4.3.2 / §5.3: the REST DTO is the source of truth for the UI).
   * A host mute is persisted on the backend and enforced by the SFU, but there
   * is no real-time wire signal to the target — server→SFU push is a future
   * hook (docs/03 §7), so the SFU only *pulls* the roster. Without this a muted
   * user's own badge (driven by local `isMuted`) never flips while everyone
   * else sees them muted. When the roster reports us muted, apply it locally:
   * flip the snapshot AND mute the mic track (whose mic_state broadcast makes
   * every other client consistent too) and lock the control via `isForceMuted`.
   * When the roster reports us unmuted, only the LOCK is released — the mic is
   * never auto-UNMUTED, as re-opening it is the user's own choice (mirrors
   * onMicApproved staying muted until they act).
   */
  reconcileSelfMute(rosterMuted: boolean): void
  sendReaction(emoji: string, selfPeerId?: string): void
  /**
   * Begin a host mute: relay it over the SFU for instant enforcement and mark
   * the peer moderation-pending (a loading skeleton badge). The authoritative
   * muted badge lands on `settlePeerMute`, never as an eager optimistic flip.
   */
  mutePeer(peerId: string): void
  /**
   * Begin a host unmute: there is NO `unmute_peer` wire signal and NO
   * optimistic unmute. A host unmute only lifts the moderation lock — the
   * target stays muted until THEY re-open their own mic (mirrors
   * reconcileSelfMute never auto-unmuting). This just marks the peer
   * moderation-pending (loading skeleton) until `settlePeerMute` clears it.
   */
  unmutePeer(peerId: string): void
  /**
   * Resolve a host mute/unmute once its backend PATCH settles: drop the peer's
   * loading skeleton. On a mute (`muted: true`) also mark the badge muted, to
   * match the SFU-enforced reality without waiting on the target's mic_state
   * echo. On an unmute (`muted: false`) the badge is left untouched — the peer
   * stays muted until they re-open their mic; this is also the error path
   * (clear the skeleton, assert nothing).
   */
  settlePeerMute(peerId: string, muted: boolean): void
  removePeer(peerId: string): void
  blockPeer(peerId: string): void
  /**
   * Record that a post's space has ended (learned from server data, e.g. a
   * refetched post whose status flipped to ended). If that space is the
   * active session — say the space_ended broadcast lost the race with the
   * socket closing and we are busy reconnecting to a dead space — the session
   * is torn down. Idempotent.
   */
  markSpaceEnded(postId: string): void
  /**
   * Listener: ask the hosts for permission to speak. The browser's mic
   * permission is secured FIRST (prompting on first use — the click is the
   * user gesture the prompt needs); only a granted browser is allowed to ask
   * the hosts, so an approval can never land on a client that cannot capture
   * audio. Resolves true when the request was actually sent.
   */
  requestMic(): Promise<boolean>
  /** Host/cohost: answer a pending mic request. */
  approveMicRequest(peerId: string): void
  denyMicRequest(peerId: string): void
  /** Host: broadcast end_space so listeners are told before we disconnect. */
  sendEndSpace(): void
  /** Stop the session locally and reset. No end_space broadcast. */
  leave(): void
  /** Show the active space's dialog again (reopen from the persistent bar). */
  openDialog(): void
  /** Hide the dialog — minimize. The session is untouched. */
  closeDialog(): void
}

/** How long a reaction emoji stays visible on an avatar. */
const REACTION_VISIBLE_MS = 3_000

const IDLE: SpaceSessionSnapshot = {
  activePostId: null,
  postTitle: null,
  role: null,
  status: 'idle',
  isMuted: false,
  isForceMuted: false,
  canSpeak: false,
  hasRequestedMic: false,
  isHostPresent: false,
  micRequests: [],
  peerIds: [],
  peerMicStates: {},
  reactions: {},
  remoteStreams: [],
  moderationPendingPeerIds: [],
  isDialogOpen: false,
  endedSpaceIds: [],
}

export function createSpaceSessionStore(
  deps: { createManager?: ManagerFactory } = {},
): SpaceSessionStore {
  const createManager: ManagerFactory =
    deps.createManager ?? ((cb, opts) => new SpaceStreamManager(cb, opts))

  let state: SpaceSessionSnapshot = IDLE
  let manager: ISpaceManager | null = null
  // The active space's host user id — peer events matching it drive
  // state.isHostPresent. Session-scoped, like the manager.
  let sessionHostId: string | null = null
  let audioContainer: HTMLDivElement | null = null
  const listeners = new Set<() => void>()
  const reactionTimers: Record<string, ReturnType<typeof setTimeout>> = {}
  // Ended spaces are remembered for the lifetime of the app, not the session:
  // resetSession() must not forget them or a stale "live" cache could rejoin.
  const endedSpaceIds = new Set<string>()

  const emit = () => listeners.forEach((l) => l())

  // Every mutation produces a fresh object so useSyncExternalStore sees a new
  // reference; unchanged reads keep returning the same one.
  const setState = (patch: Partial<SpaceSessionSnapshot>) => {
    state = { ...state, ...patch }
    emit()
  }

  const clearReactionTimers = () => {
    for (const id of Object.keys(reactionTimers)) {
      clearTimeout(reactionTimers[id])
      delete reactionTimers[id]
    }
  }

  const showReaction = (peerId: string, emoji: string) => {
    clearTimeout(reactionTimers[peerId])
    setState({ reactions: { ...state.reactions, [peerId]: emoji } })
    reactionTimers[peerId] = setTimeout(() => {
      delete reactionTimers[peerId]
      const { [peerId]: _removed, ...rest } = state.reactions
      setState({ reactions: rest })
    }, REACTION_VISIBLE_MS)
  }

  // Drop the manager reference and return to idle. Used after any terminal
  // event; the caller decides whether the manager also needs stop() called.
  const resetSession = () => {
    clearReactionTimers()
    manager = null
    sessionHostId = null
    state = { ...IDLE, endedSpaceIds: [...endedSpaceIds] }
    emit()
  }

  const recordSpaceEnded = (postId: string | null) => {
    if (postId) endedSpaceIds.add(postId)
  }

  // Presence facts implied by any peer-attributed signal. The server only
  // broadcasts NEW joins — a late joiner never receives peer_joined for peers
  // already in the room. But existing peers re-announce mic_state whenever
  // someone joins (see stream.ts), so a mic_state / reaction / mic request
  // carrying a peer_id is proof that peer is here (and, if it's the host,
  // that the host is back).
  const seenPeer = (peerId: string) => ({
    peerIds: state.peerIds.includes(peerId)
      ? state.peerIds
      : [...state.peerIds, peerId],
    isHostPresent: state.isHostPresent || peerId === sessionHostId,
  })

  // Add a peer to the moderation-pending set (loading skeleton) idempotently.
  const withPending = (peerId: string) =>
    state.moderationPendingPeerIds.includes(peerId)
      ? state.moderationPendingPeerIds
      : [...state.moderationPendingPeerIds, peerId]

  const callbacks = (): ManagerCallbacks => ({
    onStatusChange: (status) => {
      // The roster becomes untrustworthy the instant an established
      // connection is lost: peer_left broadcasts missed while the socket is
      // down are gone forever, so departed users would linger as ghosts (the
      // host reconnecting after an internet drop kept seeing users who left
      // mid-outage). Drop it on the way OUT of 'connected' — not when
      // 'connected' comes back — because peers re-announce mic_state the
      // moment the server registers our rejoin (doc 10), and that can arrive
      // over the new socket before the peer connection reports 'connected';
      // clearing on arrival would wipe those just-relearned peers. This also
      // uniformly covers the listener-promotion rebuild ('connected' →
      // 'connecting'). isHostPresent is deliberately kept: a stale `false`
      // self-heals via the host's own re-announcement, while a
      // wiped-to-`true` could never heal back — absence cannot be inferred
      // from silence.
      if (state.status === 'connected' && status !== 'connected') {
        setState({
          status,
          peerIds: [],
          peerMicStates: {},
          remoteStreams: [],
          micRequests: [],
          // Any in-flight host moderation is moot once the roster is dropped.
          moderationPendingPeerIds: [],
        })
        return
      }
      setState({ status })
    },
    onTrackReceived: (stream) => {
      if (!state.remoteStreams.some((s) => s.id === stream.id)) {
        setState({ remoteStreams: [...state.remoteStreams, stream] })
      }
    },
    onSpaceEnded: () => {
      recordSpaceEnded(state.activePostId)
      resetSession()
    },
    onPeerJoined: (peerId) => {
      if (!peerId) return
      const isNewPeer = !state.peerIds.includes(peerId)
      // The host coming (back) in — a dropped host rejoining (doc 07).
      const hostReturned = peerId === sessionHostId && !state.isHostPresent
      // Duplicate joins (reconnects re-deliver them) must not emit.
      if (!isNewPeer && !hostReturned) return
      setState(seenPeer(peerId))
    },
    onPeerLeft: (peerId) => {
      const { [peerId]: _removed, ...restMic } = state.peerMicStates
      setState({
        peerIds: state.peerIds.filter((id) => id !== peerId),
        peerMicStates: restMic,
        remoteStreams: state.remoteStreams.filter((s) => s.id !== peerId),
        // A leaver's mic request is moot — drop it from the hosts' queue.
        micRequests: state.micRequests.filter((id) => id !== peerId),
        // The host dropping must reach every listener's UI immediately. On the
        // host's own session presence stays true — they ARE the host.
        isHostPresent:
          state.role !== 'host' && peerId === sessionHostId
            ? false
            : state.isHostPresent,
      })
    },
    onPeerMicChange: (peerId, muted) =>
      setState({
        ...seenPeer(peerId),
        peerMicStates: { ...state.peerMicStates, [peerId]: muted },
      }),
    onPeerReaction: (peerId, emoji) => {
      setState(seenPeer(peerId))
      showReaction(peerId, emoji)
    },
    onMicRequest: (peerId) => {
      // Only hosts/cohosts act on requests (an approved listener can speak
      // but never moderates); also dedupe re-requests.
      if (!roleCanModerate(state.role) || state.micRequests.includes(peerId))
        return
      setState({
        ...seenPeer(peerId),
        micRequests: [...state.micRequests, peerId],
      })
    },
    onMicApproved: () =>
      // Granted the mic: may speak now, but stays muted until they unmute.
      setState({ canSpeak: true, isMuted: true, hasRequestedMic: false }),
    onMicDenied: () => setState({ hasRequestedMic: false }),
    onForceMuted: () => setState({ isMuted: true, isForceMuted: true }),
    onRemoved: () => resetSession(),
  })

  return {
    subscribe(listener) {
      listeners.add(listener)
      // NOTE: unsubscribing (a view unmounting) intentionally does NOT stop the
      // session — that is the whole point of this store.
      return () => {
        listeners.delete(listener)
      }
    },

    getSnapshot: () => state,

    attachAudioContainer(el) {
      audioContainer = el
      manager?.setAudioContainer(el)
    },

    getLocalStream: () => manager?.getLocalStream() ?? null,

    async start(args) {
      // A space known to have ended can never be (re)joined. Checked before
      // anything else so a refused join can't disturb a live session either.
      if (endedSpaceIds.has(args.postId)) {
        throw new Error('This space has ended')
      }

      // Already live in this exact space — don't interrupt the ongoing session
      // or its reconnect loop with a duplicate connect (auto-join / reopen).
      if (
        state.activePostId === args.postId &&
        state.status !== 'idle' &&
        state.status !== 'failed'
      ) {
        return
      }

      // Switching spaces (or restarting a failed one): tear the old one down.
      manager?.stop()
      clearReactionTimers()

      const rawToken = args.tokenProvider
      const tokenProvider: TokenProvider =
        typeof rawToken === 'function' ? rawToken : () => rawToken

      const canSpeak = roleCanSpeak(args.role)
      sessionHostId = args.hostId

      state = {
        ...IDLE,
        endedSpaceIds: [...endedSpaceIds],
        activePostId: args.postId,
        postTitle: args.postTitle,
        role: args.role,
        canSpeak,
        // A live space implies its host; peer_left/peer_joined take over from
        // here so absence (and a rejoin) propagates in real time.
        isHostPresent: true,
        // Everyone joins muted; hosts/cohosts opt into speaking, so nobody
        // broadcasts hot-mic audio the moment they enter. Listeners are
        // receive-only and stay muted for the whole session.
        isMuted: true,
      }
      emit()

      const m = createManager(callbacks(), {
        // Speakers keep the screen awake so the OS can't suspend their mic.
        keepScreenAwake: canSpeak,
        startMuted: true,
        sendAudio: canSpeak,
      })
      m.setAudioContainer(audioContainer)
      manager = m
      try {
        await m.start(tokenProvider, args.wsUrl)
      } catch (err) {
        // A start that never connected must not strand the UI on
        // 'connecting': mark the session failed so the card offers Rejoin
        // and a retry passes the single-active guard above.
        if (manager === m) {
          m.stop()
          setState({ status: 'failed' })
        }
        throw err
      }
    },

    toggleMute() {
      // Listeners are receive-only — there is no mic to unmute.
      if (!state.canSpeak) return
      // A host force-mute cannot be lifted by the user — only the host unmutes.
      // The control is disabled in the UI too; this is the store-level guard.
      if (state.isForceMuted) return
      const next = !state.isMuted
      manager?.toggleMute(next)
      setState({ isMuted: next })
    },

    reconcileSelfMute(rosterMuted) {
      if (!manager) return
      if (rosterMuted) {
        // Host mute learned from the roster. Engage the lock; only mute the
        // track if it isn't already off, so a user who was already self-muted
        // doesn't emit a redundant mic_state. toggleMute(true) also broadcasts
        // mic_state, which reconciles every other client's badge for us.
        if (state.isForceMuted) return
        if (!state.isMuted) manager.toggleMute(true)
        setState({ isMuted: true, isForceMuted: true })
      } else if (state.isForceMuted) {
        // The host lifted the mute. Release the lock but leave the mic muted —
        // re-opening it is the user's own choice (mirrors onMicApproved).
        setState({ isForceMuted: false })
      }
    },

    sendReaction(emoji, selfPeerId) {
      manager?.sendReaction(emoji)
      if (selfPeerId) showReaction(selfPeerId, emoji)
    },

    mutePeer(peerId) {
      // Real-time enforce over the SFU (the target force-mutes and re-announces
      // mic_state). No eager badge flip — a loading skeleton shows until the
      // authoritative PATCH settles (settlePeerMute).
      manager?.sendModeration('mute_peer', peerId)
      setState({ moderationPendingPeerIds: withPending(peerId) })
    },

    unmutePeer(peerId) {
      // No wire signal and NO optimistic unmute: a host unmute only lifts the
      // lock — the target stays muted until they re-open their own mic. Just
      // show the loading skeleton until settlePeerMute clears it.
      setState({ moderationPendingPeerIds: withPending(peerId) })
    },

    settlePeerMute(peerId, muted) {
      const moderationPendingPeerIds = state.moderationPendingPeerIds.filter(
        (id) => id !== peerId,
      )
      if (muted) {
        // A settled mute marks the badge muted; the target's mic_state echo
        // (or roster) keeps every other client consistent.
        setState({
          moderationPendingPeerIds,
          peerMicStates: { ...state.peerMicStates, [peerId]: true },
        })
      } else {
        // A settled unmute (or a failed action) only drops the skeleton — the
        // badge is untouched, so a still-muted peer keeps showing muted.
        setState({ moderationPendingPeerIds })
      }
    },

    removePeer(peerId) {
      manager?.sendModeration('remove_peer', peerId)
      setState({ peerIds: state.peerIds.filter((id) => id !== peerId) })
    },

    blockPeer(peerId) {
      manager?.sendModeration('block_peer', peerId)
      setState({ peerIds: state.peerIds.filter((id) => id !== peerId) })
    },

    markSpaceEnded(postId) {
      if (endedSpaceIds.has(postId)) return
      endedSpaceIds.add(postId)
      if (state.activePostId === postId) {
        // We were in (or reconnecting to) that space — tear it down.
        manager?.stop()
        resetSession()
      } else {
        setState({ endedSpaceIds: [...endedSpaceIds] })
      }
    },

    async requestMic() {
      // Speakers have nothing to request; one pending request at a time.
      if (!manager || state.canSpeak || state.hasRequestedMic) return false

      // Claim the pending slot BEFORE the (slow, user-facing) permission
      // prompt so a second click while it is open cannot double-request.
      const m = manager
      setState({ hasRequestedMic: true })

      const granted = await m.ensureMicAccess()

      // The session may have reset or switched while the prompt was open —
      // a stale grant must neither message the old manager nor dirty the
      // NEW session's state.
      if (manager !== m) return false

      if (!granted) {
        // Nothing was sent; free the slot so the user can try again after
        // enabling mic access in the browser.
        setState({ hasRequestedMic: false })
        return false
      }

      m.sendMicRequest()
      return true
    },

    approveMicRequest(peerId) {
      if (!roleCanModerate(state.role)) return
      manager?.sendMicApproval(peerId, true)
      setState({ micRequests: state.micRequests.filter((id) => id !== peerId) })
    },

    denyMicRequest(peerId) {
      if (!roleCanModerate(state.role)) return
      manager?.sendMicApproval(peerId, false)
      setState({ micRequests: state.micRequests.filter((id) => id !== peerId) })
    },

    sendEndSpace() {
      // The host is closing their own space — remember it as ended right away
      // so nothing (including this client) can start or join it again.
      recordSpaceEnded(state.activePostId)
      manager?.sendEndSpace()
      setState({ endedSpaceIds: [...endedSpaceIds] })
    },

    leave() {
      manager?.stop()
      resetSession()
    },

    openDialog() {
      // Nothing to reopen without a session; also keeps the app-root dialog
      // from ever showing while idle.
      if (!state.activePostId || state.isDialogOpen) return
      setState({ isDialogOpen: true })
    },

    closeDialog() {
      if (!state.isDialogOpen) return
      setState({ isDialogOpen: false })
    },
  }
}

// ─── App-wide singleton + React binding ──────────────────────────────────────

export const spaceSession = createSpaceSessionStore()

/**
 * Subscribe a component to the active space session. Returns the current
 * snapshot plus derived booleans. Actions live on the `spaceSession` singleton
 * (stable references) — import and call them directly.
 */
export function useSpaceSession() {
  const snapshot = useSyncExternalStore(
    spaceSession.subscribe,
    spaceSession.getSnapshot,
    spaceSession.getSnapshot,
  )
  return {
    ...snapshot,
    isConnected: snapshot.status === 'connected',
    isReconnecting: snapshot.status === 'reconnecting',
  }
}
