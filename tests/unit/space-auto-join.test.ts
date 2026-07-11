import { describe, expect, test } from 'vitest'
import {
  shouldAutoJoinSpace,
  type AutoJoinContext,
} from '@/utils/space-auto-join'

// The context in which auto-join IS allowed; each test flips one field to
// prove that field alone vetoes the join.
const JOINABLE: AutoJoinContext = {
  isHost: false,
  isPostLive: true,
  sessionStatus: 'idle',
  hasToken: true,
  alreadyAttempted: false,
}

describe('shouldAutoJoinSpace', () => {
  test('joins a live space for a listener with a token, once, when idle', () => {
    expect(shouldAutoJoinSpace(JOINABLE)).toBe(true)
  })

  test('hosts never auto-join — they start the space explicitly', () => {
    expect(shouldAutoJoinSpace({ ...JOINABLE, isHost: true })).toBe(false)
  })

  test('does not join a space that is not live', () => {
    expect(shouldAutoJoinSpace({ ...JOINABLE, isPostLive: false })).toBe(false)
  })

  test('does not join without a connection token', () => {
    expect(shouldAutoJoinSpace({ ...JOINABLE, hasToken: false })).toBe(false)
  })

  test('never interrupts an active or recovering session', () => {
    for (const sessionStatus of [
      'connecting',
      'connected',
      'reconnecting',
    ] as const) {
      expect(shouldAutoJoinSpace({ ...JOINABLE, sessionStatus })).toBe(false)
    }
  })

  test('does not auto-rejoin from failed — that is the manual Rejoin button', () => {
    expect(shouldAutoJoinSpace({ ...JOINABLE, sessionStatus: 'failed' })).toBe(
      false,
    )
  })

  test('joins at most once per view: a session that reset mid-view must not silently rejoin', () => {
    // Regression: the session dropping back to idle (space ended, user
    // removed, background disconnect) used to re-trigger auto-join, making
    // the space UI close and reopen by itself in a loop.
    expect(shouldAutoJoinSpace({ ...JOINABLE, alreadyAttempted: true })).toBe(
      false,
    )
  })
})
