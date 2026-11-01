import { cn } from '@/libs/utils'
import { spaceSession, useSpaceSession } from '@/utils/space-session-store'
import { LogOut, Mic, MicOff, Radio } from 'lucide-react'
import { Button } from '../ui/button'
import { useEndSpace } from './use-end-space'

/**
 * The bar's reopen control, addressable by id so the app-root space dialog can
 * return focus to the element that opened it when it closes (the standard
 * modal focus contract — and the bar is position-fixed, so focusing it can
 * never scroll the page).
 */
export const SPACE_BAR_REOPEN_BUTTON_ID = 'persistent-space-bar-reopen'

/**
 * A floating "you're still live" bar shown whenever a space session is active.
 * Because the session outlives the dialog, this is how a user keeps control
 * (mute / leave / end) after closing the popup — mirroring the X/Twitter Spaces
 * mini-player. It renders nothing when there is no active session.
 */
export function PersistentSpaceBar() {
  const session = useSpaceSession()
  const endSpace = useEndSpace(session.activePostId)

  if (!session.activePostId || session.status === 'idle') return null

  const isHost = session.role === 'host'

  const statusLabel =
    session.status === 'connected'
      ? 'Live'
      : session.status === 'reconnecting'
        ? 'Reconnecting…'
        : session.status === 'failed'
          ? 'Disconnected'
          : 'Connecting…'

  const dotClass =
    session.status === 'connected'
      ? 'bg-green-500 animate-pulse'
      : session.status === 'reconnecting'
        ? 'bg-amber-500 animate-pulse'
        : session.status === 'failed'
          ? 'bg-red-500'
          : 'bg-gray-400'

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur"
    >
      <div className="flex items-center gap-3">
        {/* The whole info area reopens the space popup — this is the way back
            in after minimizing; the action buttons alongside stay separate. */}
        <button
          type="button"
          id={SPACE_BAR_REOPEN_BUTTON_ID}
          aria-label="Reopen space"
          onClick={() => spaceSession.openDialog()}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <Radio className="h-4 w-4 text-gray-600" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {session.postTitle ?? 'Space'}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={cn('h-1.5 w-1.5 rounded-full', dotClass)} />
              {statusLabel}
              {isHost ? ' · Hosting' : ' · Listening'}
            </p>
          </div>
        </button>

        {session.canSpeak &&
          (session.status === 'connected' ||
            session.status === 'reconnecting') && (
            <Button
              aria-label={
                session.isForceMuted
                  ? 'Muted by host'
                  : session.isMuted
                    ? 'Unmute'
                    : 'Mute'
              }
              title={
                session.isForceMuted
                  ? 'The host muted you — only they can unmute'
                  : undefined
              }
              disabled={session.isForceMuted}
              onClick={() => spaceSession.toggleMute()}
              className={cn(
                'h-9 w-9 shrink-0 p-0',
                session.isForceMuted
                  ? 'border-gray-300 bg-gray-100 text-gray-500 disabled:cursor-not-allowed'
                  : session.isMuted
                    ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
                    : 'border-green-300 bg-green-50 hover:bg-green-100',
              )}
            >
              {session.isMuted ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}

        {isHost ? (
          <Button
            onClick={() => endSpace.mutate()}
            disabled={endSpace.isPending}
            className="h-9 shrink-0 gap-1.5 bg-rose-500 px-3 text-white hover:bg-rose-600"
          >
            <LogOut className="h-4 w-4" />
            End
          </Button>
        ) : (
          <Button
            onClick={() => spaceSession.leave()}
            className="h-9 shrink-0 gap-1.5 bg-gray-800 px-3 text-white hover:bg-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Leave
          </Button>
        )}
      </div>

      <p className="mt-2 text-[11px] text-gray-400">
        Keep this tab open to stay {isHost ? 'live' : 'connected'} · tap the
        title to reopen.
      </p>
    </div>
  )
}
