import type { ConnectionStatus } from './stream'

export interface ManualJoinContext {
  /** The post's server-side status says the space is live. */
  isPostLive: boolean
  /** The space is known to have ended (store memory or fresh server data). */
  spaceEnded: boolean
  /** THIS card's session status — 'idle' when another/no space is active. */
  sessionStatus: ConnectionStatus
}

/**
 * Whether the space dialog should offer the manual Join/Rejoin button.
 *
 * Deliberately role-blind: a host who lost their session (page refresh, a
 * network drop that exhausted the reconnect budget, a start() that failed)
 * needs a way back into their own still-live space exactly as a listener
 * does — hiding the button behind !isHost left hosts with only "End space".
 *
 * Offered from 'idle' and 'failed' only: connected/reconnecting sessions are
 * already being handled, and 'connecting' must not allow a duplicate start.
 */
export const shouldOfferManualJoin = (ctx: ManualJoinContext): boolean =>
  ctx.isPostLive &&
  !ctx.spaceEnded &&
  (ctx.sessionStatus === 'idle' || ctx.sessionStatus === 'failed')
