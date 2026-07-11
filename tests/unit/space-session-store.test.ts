import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  createSpaceSessionStore,
  roleCanModerate,
  type ISpaceManager,
  type SpaceSessionStore,
  type StartArgs,
} from '@/utils/space-session-store'
import type {
  ManagerCallbacks,
  ManagerOptions,
  ModerationAction,
  TokenProvider,
} from '@/utils/stream'

// A fake manager that records every call and lets tests drive server events by
// invoking the callbacks the store handed it. No browser APIs, so this runs in
// the plain node vitest environment.
class FakeManager implements ISpaceManager {
  stopCount = 0
  endSpaceCount = 0
  started: { wsUrl: string; token: string } | null = null
  muteCalls: boolean[] = []
  reactions: string[] = []
  moderation: Array<{ action: ModerationAction; peerId: string }> = []
  micRequestCount = 0
  micApprovals: Array<{ peerId: string; approved: boolean }> = []
  container: HTMLDivElement | null = null
  private micEnabled = true

  constructor(
    readonly cb: ManagerCallbacks,
    readonly opts?: ManagerOptions,
  ) {}

  /** When set, start() rejects with it — simulates a connect failure. */
  startError: Error | null = null

  setAudioContainer(el: HTMLDivElement | null): void {
    this.container = el
  }
  async start(tokenProvider: TokenProvider, wsUrl: string): Promise<void> {
    if (this.startError) throw this.startError
    this.started = { wsUrl, token: await tokenProvider() }
  }
  stop(): void {
    this.stopCount += 1
  }
  toggleMute(muted: boolean): void {
    this.muteCalls.push(muted)
    this.micEnabled = !muted
  }
  getMicEnabled(): boolean | null {
    return this.micEnabled
  }
  localStream: MediaStream | null = null
  getLocalStream(): MediaStream | null {
    return this.localStream
  }
  sendEndSpace(): void {
    this.endSpaceCount += 1
  }
  sendReaction(emoji: string): void {
    this.reactions.push(emoji)
  }
  sendModeration(action: ModerationAction, peerId: string): void {
    this.moderation.push({ action, peerId })
  }
  sendMicRequest(): void {
    this.micRequestCount += 1
  }
  sendMicApproval(peerId: string, approved: boolean): void {
    this.micApprovals.push({ peerId, approved })
  }
}

const HOST_ARGS: StartArgs = {
  postId: 'p1',
  postTitle: 'Morning Space',
  role: 'host',
  hostId: 'u-host',
  tokenProvider: 'tok-1',
  wsUrl: 'ws://sfu.test/ws',
}

function setup(onCreate?: (m: FakeManager) => void) {
  const managers: FakeManager[] = []
  const store = createSpaceSessionStore({
    createManager: (cb, opts) => {
      const m = new FakeManager(cb, opts)
      onCreate?.(m)
      managers.push(m)
      return m
    },
  })
  return {
    store,
    managers,
    last: () => managers[managers.length - 1],
  }
}

// Start a session and move it to 'connected', returning the active manager.
async function startConnected(
  store: SpaceSessionStore,
  last: () => FakeManager,
  args: StartArgs = HOST_ARGS,
) {
  await store.start(args)
  const m = last()
  m.cb.onStatusChange('connecting')
  m.cb.onStatusChange('connected')
  return m
}

describe('space session store', () => {
  test('start records the active space and drives status from the manager', async () => {
    const { store, last } = setup()

    await store.start(HOST_ARGS)
    const m = last()
    expect(m.started).toEqual({ wsUrl: 'ws://sfu.test/ws', token: 'tok-1' })

    m.cb.onStatusChange('connecting')
    m.cb.onStatusChange('connected')

    const snap = store.getSnapshot()
    expect(snap.status).toBe('connected')
    expect(snap.activePostId).toBe('p1')
    expect(snap.postTitle).toBe('Morning Space')
    expect(snap.role).toBe('host')
  })

  test('requests a screen wake lock only for speakers (host/cohost)', async () => {
    const host = setup()
    await host.store.start(HOST_ARGS)
    expect(host.last().opts?.keepScreenAwake).toBe(true)

    const cohost = setup()
    await cohost.store.start({ ...HOST_ARGS, role: 'cohost' })
    expect(cohost.last().opts?.keepScreenAwake).toBe(true)

    const listener = setup()
    await listener.store.start({ ...HOST_ARGS, role: 'listener' })
    expect(listener.last().opts?.keepScreenAwake).toBe(false)
  })

  test('only hosts and cohosts publish audio; listeners are receive-only', async () => {
    const host = setup()
    await host.store.start(HOST_ARGS)
    expect(host.last().opts?.sendAudio).toBe(true)
    expect(host.store.getSnapshot().canSpeak).toBe(true)

    const cohost = setup()
    await cohost.store.start({ ...HOST_ARGS, role: 'cohost' })
    expect(cohost.last().opts?.sendAudio).toBe(true)
    expect(cohost.store.getSnapshot().canSpeak).toBe(true)

    const listener = setup()
    await listener.store.start({ ...HOST_ARGS, role: 'listener' })
    expect(listener.last().opts?.sendAudio).toBe(false)
    expect(listener.store.getSnapshot().canSpeak).toBe(false)
  })

  test('a listener can request the mic once until answered', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, {
      ...HOST_ARGS,
      role: 'listener',
    })

    store.requestMic()
    expect(m.micRequestCount).toBe(1)
    expect(store.getSnapshot().hasRequestedMic).toBe(true)

    store.requestMic() // still pending — must not spam the hosts
    expect(m.micRequestCount).toBe(1)
  })

  test('speakers never send mic requests', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    store.requestMic()

    expect(m.micRequestCount).toBe(0)
    expect(store.getSnapshot().hasRequestedMic).toBe(false)
  })

  test('hosts collect deduped mic requests and drop them when the peer leaves', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    m.cb.onMicRequest('alice')
    m.cb.onMicRequest('alice') // re-request while pending
    m.cb.onMicRequest('bob')
    expect(store.getSnapshot().micRequests).toEqual(['alice', 'bob'])

    m.cb.onPeerLeft('bob')
    expect(store.getSnapshot().micRequests).toEqual(['alice'])
  })

  // ── Mic-request moderation is role-gated, not canSpeak-gated ─────────────
  // The bug: onMicApproved flips canSpeak for a promoted listener, and every
  // moderation gate keyed off canSpeak — so an approved listener started
  // collecting requests and could relay approve_mic/deny_mic. Only hosts and
  // cohosts moderate; a promoted listener may speak, nothing more.

  test('roleCanModerate: only hosts and cohosts, never by canSpeak promotion', () => {
    expect(roleCanModerate('host')).toBe(true)
    expect(roleCanModerate('cohost')).toBe(true)
    expect(roleCanModerate('listener')).toBe(false)
    expect(roleCanModerate(null)).toBe(false)
  })

  test('an approved listener never collects mic requests', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, {
      ...HOST_ARGS,
      role: 'listener',
    })
    store.requestMic()
    m.cb.onMicApproved()
    expect(store.getSnapshot().canSpeak).toBe(true)

    m.cb.onMicRequest('bob')

    expect(store.getSnapshot().micRequests).toEqual([])
  })

  test('an approved listener cannot answer mic requests', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, {
      ...HOST_ARGS,
      role: 'listener',
    })
    store.requestMic()
    m.cb.onMicApproved()

    store.approveMicRequest('bob')
    store.denyMicRequest('bob')

    expect(m.micApprovals).toEqual([])
  })

  test('cohosts collect and answer mic requests like hosts', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, {
      ...HOST_ARGS,
      role: 'cohost',
    })

    m.cb.onMicRequest('alice')
    expect(store.getSnapshot().micRequests).toEqual(['alice'])

    store.approveMicRequest('alice')
    expect(m.micApprovals).toEqual([{ peerId: 'alice', approved: true }])
  })

  test('listeners ignore mic request broadcasts', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, {
      ...HOST_ARGS,
      role: 'listener',
    })

    m.cb.onMicRequest('alice')

    expect(store.getSnapshot().micRequests).toEqual([])
  })

  test('approving relays the grant and clears the request', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)
    m.cb.onMicRequest('alice')

    store.approveMicRequest('alice')

    expect(m.micApprovals).toEqual([{ peerId: 'alice', approved: true }])
    expect(store.getSnapshot().micRequests).toEqual([])
  })

  test('denying relays the refusal and clears the request', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)
    m.cb.onMicRequest('alice')

    store.denyMicRequest('alice')

    expect(m.micApprovals).toEqual([{ peerId: 'alice', approved: false }])
    expect(store.getSnapshot().micRequests).toEqual([])
  })

  test('an approved listener can speak but joins the stage muted', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, {
      ...HOST_ARGS,
      role: 'listener',
    })
    store.requestMic()

    m.cb.onMicApproved()

    const snap = store.getSnapshot()
    expect(snap.canSpeak).toBe(true)
    expect(snap.isMuted).toBe(true)
    expect(snap.hasRequestedMic).toBe(false)

    // The permission is real: toggleMute now reaches the manager.
    store.toggleMute()
    expect(m.muteCalls).toEqual([false])
  })

  test('a denied listener may ask again', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, {
      ...HOST_ARGS,
      role: 'listener',
    })
    store.requestMic()

    m.cb.onMicDenied()
    expect(store.getSnapshot().canSpeak).toBe(false)
    expect(store.getSnapshot().hasRequestedMic).toBe(false)

    store.requestMic()
    expect(m.micRequestCount).toBe(2)
  })

  test('toggleMute is a no-op for listeners — they can never unmute', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, {
      ...HOST_ARGS,
      role: 'listener',
    })

    store.toggleMute()

    expect(m.muteCalls).toEqual([])
    expect(store.getSnapshot().isMuted).toBe(true)
  })

  // The core bug: closing the popup unmounts the view, which unsubscribes from
  // the store. That MUST NOT tear down the live session.
  test('session survives every view unsubscribing (closing the popup)', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    const unsubA = store.subscribe(() => {})
    const unsubB = store.subscribe(() => {})
    unsubA()
    unsubB() // last view unmounts → all subscribers gone

    expect(m.stopCount).toBe(0)
    expect(store.getSnapshot().status).toBe('connected')
    expect(store.getSnapshot().activePostId).toBe('p1')
  })

  test('leave() stops the manager without broadcasting end_space', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    store.leave()

    expect(m.stopCount).toBe(1)
    expect(m.endSpaceCount).toBe(0)
    expect(store.getSnapshot().activePostId).toBeNull()
    expect(store.getSnapshot().status).toBe('idle')
  })

  test('sendEndSpace() broadcasts end_space over the manager', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    store.sendEndSpace()

    expect(m.endSpaceCount).toBe(1)
  })

  test('resets when the server reports the space ended', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    m.cb.onSpaceEnded('The host ended this Space')

    expect(store.getSnapshot().activePostId).toBeNull()
    expect(store.getSnapshot().status).toBe('idle')
  })

  test('a space ended by the server is remembered and cannot be rejoined', async () => {
    const { store, last, managers } = setup()
    const listenerArgs: StartArgs = { ...HOST_ARGS, role: 'listener' }
    const m = await startConnected(store, last, listenerArgs)

    m.cb.onSpaceEnded('The host ended this Space')

    const snap = store.getSnapshot()
    expect(snap.status).toBe('idle')
    expect(snap.endedSpaceIds).toContain('p1')

    // Every join path funnels through start() — auto-join on dialog open,
    // the manual Join button, a reopened dialog. All must be refused.
    await expect(store.start(listenerArgs)).rejects.toThrow(/ended/)
    expect(managers).toHaveLength(1)
  })

  test('sendEndSpace marks the host own space as ended so it cannot restart', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    store.sendEndSpace()
    expect(m.endSpaceCount).toBe(1)
    expect(store.getSnapshot().endedSpaceIds).toContain('p1')

    store.leave()
    await expect(store.start(HOST_ARGS)).rejects.toThrow(/ended/)
  })

  test('markSpaceEnded tears down the active session for that post', async () => {
    const { store, last, managers } = setup()
    const m = await startConnected(store, last, {
      ...HOST_ARGS,
      role: 'listener',
    })

    // The client learned from refetched post data that the space ended —
    // e.g. the space_ended broadcast lost the race with the socket closing.
    store.markSpaceEnded('p1')

    expect(m.stopCount).toBe(1)
    const snap = store.getSnapshot()
    expect(snap.status).toBe('idle')
    expect(snap.activePostId).toBeNull()
    expect(snap.endedSpaceIds).toContain('p1')
    expect(managers).toHaveLength(1)
  })

  test('markSpaceEnded for another post records it without touching the session', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    store.markSpaceEnded('p9')

    expect(m.stopCount).toBe(0)
    const snap = store.getSnapshot()
    expect(snap.status).toBe('connected')
    expect(snap.activePostId).toBe('p1')
    expect(snap.endedSpaceIds).toContain('p9')

    // Refusing to join the ended space must not disturb the live session.
    await expect(
      store.start({ ...HOST_ARGS, postId: 'p9', role: 'listener' }),
    ).rejects.toThrow(/ended/)
    expect(store.getSnapshot().status).toBe('connected')
    expect(store.getSnapshot().activePostId).toBe('p1')
  })

  test('ended memory survives resets and does not block other spaces', async () => {
    const { store, last, managers } = setup()
    const m = await startConnected(store, last, {
      ...HOST_ARGS,
      role: 'listener',
    })
    m.cb.onSpaceEnded('done')

    await store.start({ ...HOST_ARGS, postId: 'p2', role: 'listener' })
    expect(managers).toHaveLength(2)

    const snap = store.getSnapshot()
    expect(snap.activePostId).toBe('p2')
    expect(snap.endedSpaceIds).toContain('p1')
  })

  test('resets when this client is removed', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    m.cb.onRemoved('blocked')

    expect(store.getSnapshot().activePostId).toBeNull()
  })

  test('tracks peers joining, leaving and their mic state', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    m.cb.onPeerJoined('alice')
    m.cb.onPeerJoined('bob')
    m.cb.onPeerMicChange('alice', true)
    m.cb.onPeerLeft('bob')

    const snap = store.getSnapshot()
    expect(snap.peerIds).toEqual(['alice'])
    expect(snap.peerMicStates.alice).toBe(true)
    expect(snap.peerMicStates.bob).toBeUndefined()
  })

  test('every session starts muted, for hosts and listeners alike', async () => {
    const host = setup()
    await host.store.start(HOST_ARGS)
    expect(host.store.getSnapshot().isMuted).toBe(true)
    expect(host.last().opts?.startMuted).toBe(true)

    const listener = setup()
    await listener.store.start({ ...HOST_ARGS, role: 'listener' })
    expect(listener.store.getSnapshot().isMuted).toBe(true)
    expect(listener.last().opts?.startMuted).toBe(true)
  })

  test('toggleMute updates both the manager and the snapshot', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    // Sessions begin muted, so the first toggle unmutes.
    store.toggleMute()
    expect(store.getSnapshot().isMuted).toBe(false)
    expect(m.muteCalls).toEqual([false])

    store.toggleMute()
    expect(store.getSnapshot().isMuted).toBe(true)
    expect(m.muteCalls).toEqual([false, true])
  })

  test('a self reaction pops immediately, is sent, then auto-clears', async () => {
    vi.useFakeTimers()
    try {
      const { store, last } = setup()
      const m = await startConnected(store, last)

      store.sendReaction('🔥', 'me')
      expect(m.reactions).toEqual(['🔥'])
      expect(store.getSnapshot().reactions.me).toBe('🔥')

      vi.advanceTimersByTime(3_000)
      expect(store.getSnapshot().reactions.me).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })

  test('optimistic moderation relays to the manager and updates local state', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)
    m.cb.onPeerJoined('alice')

    store.mutePeer('alice')
    expect(store.getSnapshot().peerMicStates.alice).toBe(true)

    store.removePeer('alice')
    expect(store.getSnapshot().peerIds).not.toContain('alice')

    expect(m.moderation).toEqual([
      { action: 'mute_peer', peerId: 'alice' },
      { action: 'remove_peer', peerId: 'alice' },
    ])
  })

  test('starting a different space tears down the previous manager', async () => {
    const { store, managers, last } = setup()
    await startConnected(store, last)

    await store.start({ ...HOST_ARGS, postId: 'p2', postTitle: 'Second' })

    expect(managers).toHaveLength(2)
    expect(managers[0].stopCount).toBe(1)
    expect(store.getSnapshot().activePostId).toBe('p2')
  })

  test('re-starting the same live space is a no-op (auto-join guard)', async () => {
    const { store, managers, last } = setup()
    const first = await startConnected(store, last)

    await store.start(HOST_ARGS) // e.g. a listener effect re-fires on reopen

    expect(managers).toHaveLength(1)
    expect(last()).toBe(first)
    expect(first.stopCount).toBe(0)
  })

  test('a failed session can be restarted for the same space', async () => {
    const { store, managers, last } = setup()
    await store.start(HOST_ARGS)
    last().cb.onStatusChange('failed')

    await store.start(HOST_ARGS)

    expect(managers).toHaveLength(2)
    expect(store.getSnapshot().status).not.toBe('failed')
  })

  test('notifies subscribers on state change', async () => {
    const { store, last } = setup()
    await store.start(HOST_ARGS)
    const m = last()

    const spy = vi.fn()
    store.subscribe(spy)
    m.cb.onStatusChange('connected')

    expect(spy).toHaveBeenCalled()
  })

  test('getLocalStream proxies the active manager and is null when idle', async () => {
    const { store, last } = setup()
    expect(store.getLocalStream()).toBeNull()

    const m = await startConnected(store, last)
    const fakeStream = { id: 'self' } as MediaStream
    m.localStream = fakeStream

    expect(store.getLocalStream()).toBe(fakeStream)

    store.leave()
    expect(store.getLocalStream()).toBeNull()
  })

  test('a start() that fails lands on failed — not stuck on connecting', async () => {
    let failNext = true
    const { store, last, managers } = setup((m) => {
      if (failNext) m.startError = new Error('ws timed out')
    })

    await expect(store.start(HOST_ARGS)).rejects.toThrow('ws timed out')

    // 'failed' (not a stranded 'connecting') so the card offers Rejoin and a
    // fresh start() for the same post passes the single-active guard.
    const snap = store.getSnapshot()
    expect(snap.status).toBe('failed')
    expect(snap.activePostId).toBe('p1')
    expect(last().stopCount).toBe(1)

    // And the user can actually rejoin the same space afterwards.
    failNext = false
    await store.start(HOST_ARGS)
    expect(managers).toHaveLength(2)
    last().cb.onStatusChange('connected')
    expect(store.getSnapshot().status).toBe('connected')
  })

  // ── Host presence ─────────────────────────────────────────────────────────
  // The bug: the host's connection dropped (server broadcast peer_left for
  // them), but every listener kept seeing the host in the participant list.
  // Presence must be driven by the host's own peer_joined / peer_left events.

  const LISTENER_ARGS: StartArgs = { ...HOST_ARGS, role: 'listener' }

  test('a freshly started session presumes the host is present', async () => {
    const { store, last } = setup()
    await startConnected(store, last, LISTENER_ARGS)

    expect(store.getSnapshot().isHostPresent).toBe(true)
  })

  test("the host's peer_left marks them absent in real time — the regression", async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, LISTENER_ARGS)
    m.cb.onPeerJoined('u-host')
    m.cb.onPeerJoined('bob')

    m.cb.onPeerLeft('u-host')

    const snap = store.getSnapshot()
    expect(snap.isHostPresent).toBe(false)
    expect(snap.peerIds).toEqual(['bob'])
  })

  test("the host's peer_joined (a rejoin) restores presence", async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, LISTENER_ARGS)
    m.cb.onPeerLeft('u-host')
    expect(store.getSnapshot().isHostPresent).toBe(false)

    m.cb.onPeerJoined('u-host')

    expect(store.getSnapshot().isHostPresent).toBe(true)
  })

  test('a non-host peer leaving never touches host presence', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, LISTENER_ARGS)
    m.cb.onPeerJoined('bob')

    m.cb.onPeerLeft('bob')

    expect(store.getSnapshot().isHostPresent).toBe(true)
  })

  test("the host's own session always reports the host present", async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last) // role: 'host'

    // Defensive: even a stray echo of our own peer_left must not make the
    // host's UI claim the host (themselves) is gone.
    m.cb.onPeerLeft('u-host')

    expect(store.getSnapshot().isHostPresent).toBe(true)
  })

  // ── Late-joiner peer discovery ────────────────────────────────────────────
  // The bug: user1 joins, then user2 joins. The server only broadcasts NEW
  // joins, so user2 never receives peer_joined for user1 and can't see them.
  // Existing peers re-announce mic_state whenever someone joins (stream.ts),
  // and the store must treat ANY peer-attributed signal as proof of presence.

  test("a peer's mic_state reveals their presence to a late joiner — the regression", async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, LISTENER_ARGS)

    // user1 was already in the room; we (user2) only ever hear their
    // re-announced mic state — never a peer_joined.
    m.cb.onPeerMicChange('user1', false)

    const snap = store.getSnapshot()
    expect(snap.peerIds).toContain('user1')
    expect(snap.peerMicStates.user1).toBe(false)
  })

  test("a known peer's mic_state does not duplicate them", async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, LISTENER_ARGS)
    m.cb.onPeerJoined('user1')

    m.cb.onPeerMicChange('user1', true)

    expect(store.getSnapshot().peerIds).toEqual(['user1'])
  })

  test("a peer's reaction reveals their presence", async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, LISTENER_ARGS)

    m.cb.onPeerReaction('user1', '🔥')

    expect(store.getSnapshot().peerIds).toContain('user1')
    expect(store.getSnapshot().reactions.user1).toBe('🔥')
  })

  test("a mic request reveals the requester's presence to moderators", async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last) // role: 'host'

    m.cb.onMicRequest('user1')

    expect(store.getSnapshot().peerIds).toContain('user1')
  })

  test('a signal from the host also restores host presence', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, LISTENER_ARGS)
    m.cb.onPeerLeft('u-host')
    expect(store.getSnapshot().isHostPresent).toBe(false)

    // The host reconnected before we saw a peer_joined for them — their
    // re-announced mic state is just as good a proof of presence.
    m.cb.onPeerMicChange('u-host', true)

    expect(store.getSnapshot().isHostPresent).toBe(true)
  })

  // ── Stale roster across a reconnect ───────────────────────────────────────
  // The bug: the host's internet dropped; a user left during the outage. The
  // peer_left broadcast could never reach the dead socket, so after the
  // manager reconnected the host kept seeing users who were long gone. Any
  // roster carried across a reconnect is untrustworthy — missed removals are
  // lost forever — so it must be dropped and rebuilt from live signals.

  test('a reconnect drops the stale roster — the ghost-peer regression', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)
    m.cb.onPeerJoined('user1')
    m.cb.onPeerMicChange('user1', false)
    m.cb.onMicRequest('user1')
    m.cb.onTrackReceived({ id: 'user1' } as MediaStream)

    // The outage: user1's peer_left happens while we're offline and is never
    // delivered. The manager reconnects on its own.
    m.cb.onStatusChange('reconnecting')
    m.cb.onStatusChange('connected')

    const snap = store.getSnapshot()
    expect(snap.status).toBe('connected')
    expect(snap.peerIds).toEqual([])
    expect(snap.peerMicStates).toEqual({})
    expect(snap.micRequests).toEqual([])
    expect(snap.remoteStreams).toEqual([])
  })

  test('peers still present re-appear right after a reconnect', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)
    m.cb.onPeerJoined('user1')
    m.cb.onPeerJoined('user2')

    m.cb.onStatusChange('reconnecting')
    m.cb.onStatusChange('connected')

    // Our rejoin is a fresh join server-side: everyone actually in the room
    // re-announces mic_state (doc 10) and presence is re-inferred from it.
    m.cb.onPeerMicChange('user2', true)

    expect(store.getSnapshot().peerIds).toEqual(['user2'])
  })

  test('a reconnect preserves learned host absence until the host proves otherwise', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, LISTENER_ARGS)
    m.cb.onPeerLeft('u-host')
    expect(store.getSnapshot().isHostPresent).toBe(false)

    m.cb.onStatusChange('reconnecting')
    m.cb.onStatusChange('connected')

    // Absence cannot be inferred from silence — a wiped-to-true flag could
    // never heal back. Stale false heals itself: a returned host re-announces.
    expect(store.getSnapshot().isHostPresent).toBe(false)
    m.cb.onPeerMicChange('u-host', true)
    expect(store.getSnapshot().isHostPresent).toBe(true)
  })

  test('discovery signals arriving mid-reconnect survive into connected', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)
    m.cb.onPeerJoined('user1')
    m.cb.onStatusChange('reconnecting')

    // The server registers our rejoin at the WS layer, so peers' re-announced
    // mic_state can land BEFORE our peer connection reports 'connected'.
    // Those are fresh facts about the new connection — they must not be wiped
    // by the transition that follows them.
    m.cb.onPeerMicChange('user2', true)
    m.cb.onStatusChange('connected')

    expect(store.getSnapshot().peerIds).toEqual(['user2'])
  })

  test('a promotion rebuild (connected → connecting) also drops the roster', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, LISTENER_ARGS)
    m.cb.onPeerJoined('user1')

    // enableSpeaking tears the socket down too — the same missed-events
    // window applies, and the same re-announcements repopulate the list.
    m.cb.onStatusChange('connecting')

    expect(store.getSnapshot().peerIds).toEqual([])
  })

  test('a duplicate peer_joined does not emit a new snapshot', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, LISTENER_ARGS)
    m.cb.onPeerJoined('u-host')

    const before = store.getSnapshot()
    m.cb.onPeerJoined('u-host') // reconnects re-deliver joins

    expect(store.getSnapshot()).toBe(before)
  })

  test('host absence does not survive into the next session', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last, LISTENER_ARGS)
    m.cb.onPeerLeft('u-host')
    store.leave()

    await startConnected(store, last, { ...LISTENER_ARGS, postId: 'p2' })

    expect(store.getSnapshot().isHostPresent).toBe(true)
  })

  test('getSnapshot returns a stable reference until state changes', async () => {
    const { store, last } = setup()
    const m = await startConnected(store, last)

    const a = store.getSnapshot()
    const b = store.getSnapshot()
    expect(a).toBe(b)

    m.cb.onPeerJoined('alice')
    expect(store.getSnapshot()).not.toBe(a)
  })
})

beforeEach(() => {
  vi.restoreAllMocks()
})
