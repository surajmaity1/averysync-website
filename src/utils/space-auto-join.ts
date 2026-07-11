import type { ConnectionStatus } from './stream'

export interface AutoJoinContext {
  /** Hosts start their space explicitly — auto-join is a listener behavior. */
  isHost: boolean
  /** The post's server-side status says the space is live. */
  isPostLive: boolean
  /** The GLOBAL session status — never steal the user from another space. */
  sessionStatus: ConnectionStatus
  /** A connection token has been fetched for this post. */
  hasToken: boolean
  /** This view already auto-joined once. */
  alreadyAttempted: boolean
}

/**
 * Whether opening a live space's dialog should connect the viewer
 * automatically.
 *
 * The contract is AT MOST ONCE PER VIEW: `alreadyAttempted` is never re-armed
 * while the dialog stays open. If the session later resets to idle mid-view —
 * the host ended the space, the user was removed, or a backgrounded tab's
 * session was written off by the server — silently re-joining would make the
 * space UI tear down and reopen by itself (and rejoin spaces the user was just
 * removed from). Getting back in is the manual Join/Rejoin button.
 */
export const shouldAutoJoinSpace = (ctx: AutoJoinContext): boolean =>
  !ctx.isHost &&
  ctx.isPostLive &&
  ctx.sessionStatus === 'idle' &&
  ctx.hasToken &&
  !ctx.alreadyAttempted
