import { describe, expect, test } from 'vitest'
import {
  shouldOfferManualJoin,
  type ManualJoinContext,
} from '../../src/utils/space-manual-join'

const ctx = (
  overrides: Partial<ManualJoinContext> = {},
): ManualJoinContext => ({
  isPostLive: true,
  spaceEnded: false,
  sessionStatus: 'idle',
  ...overrides,
})

describe('shouldOfferManualJoin', () => {
  test('a disconnected HOST of a live space is offered the join — the regression', () => {
    // The host started the space, lost the session (refresh, network, a
    // start() that failed), and reopened the dialog. The space is still live
    // on the server; the host must be able to get back in. There is no
    // isHost field in the context at all: host and listener share the rule.
    expect(shouldOfferManualJoin(ctx({ sessionStatus: 'idle' }))).toBe(true)
  })

  test('a failed session is offered a rejoin', () => {
    expect(shouldOfferManualJoin(ctx({ sessionStatus: 'failed' }))).toBe(true)
  })

  test('a post that is not live offers nothing', () => {
    expect(shouldOfferManualJoin(ctx({ isPostLive: false }))).toBe(false)
  })

  test('an ended space offers nothing', () => {
    expect(shouldOfferManualJoin(ctx({ spaceEnded: true }))).toBe(false)
  })

  test('a connected session offers nothing', () => {
    expect(shouldOfferManualJoin(ctx({ sessionStatus: 'connected' }))).toBe(
      false,
    )
  })

  test('a reconnecting session offers nothing (the loop is already at it)', () => {
    expect(shouldOfferManualJoin(ctx({ sessionStatus: 'reconnecting' }))).toBe(
      false,
    )
  })

  test('a connecting session offers nothing (prevents a duplicate start)', () => {
    expect(shouldOfferManualJoin(ctx({ sessionStatus: 'connecting' }))).toBe(
      false,
    )
  })
})
