import { AvatarUser } from '@/components/ui/avatar'
import { cn } from '@/libs/utils'
import { ArrowLeft, Check, X } from 'lucide-react'
import type { ChatConversation } from '../chat.types'
import { getLastMessage } from '../chat.utils'

type MessageRequestListProps = {
  requests: ChatConversation[]
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onBack: () => void
  className?: string
  /**
   * Force the back button to show at every breakpoint. The full-page layout
   * hides it on desktop (the conversation list sits alongside), but the compact
   * floating widget is single-column at all sizes and always needs a way back.
   */
  alwaysShowBack?: boolean
}

const RequestRow = ({
  request,
  onAccept,
  onDecline,
}: {
  request: ChatConversation
  onAccept: (id: string) => void
  onDecline: (id: string) => void
}) => {
  const { participant } = request
  const intro = getLastMessage(request)?.text ?? 'Wants to send you a message'

  return (
    <li className="flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50">
      <div className="flex-shrink-0">
        <AvatarUser src={participant.image} name={participant.name} size={44} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">
          {participant.name}
        </p>
        <p className="text-xs text-slate-400">{participant.role}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-600">{intro}</p>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAccept(request.id)}
            aria-label={`Accept request from ${participant.name}`}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-blue-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Check className="h-3.5 w-3.5" />
            Accept
          </button>
          <button
            type="button"
            onClick={() => onDecline(request.id)}
            aria-label={`Decline request from ${participant.name}`}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
          >
            <X className="h-3.5 w-3.5" />
            Decline
          </button>
        </div>
      </div>
    </li>
  )
}

/**
 * The message-requests inbox: people who want to reach the user but aren't
 * connected yet. Mirrors `ConversationList`'s look — a titled header with a
 * back control, then a scrolling list — but each row offers accept/decline
 * instead of opening a thread.
 */
export const MessageRequestList = ({
  requests,
  onAccept,
  onDecline,
  onBack,
  className,
  alwaysShowBack = false,
}: MessageRequestListProps) => {
  return (
    <section
      aria-label="Message requests"
      className={cn('flex min-h-0 flex-col bg-white', className)}
    >
      <header className="flex flex-shrink-0 items-center gap-2 border-b border-slate-100 px-3 pt-4 pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100',
            !alwaysShowBack && 'md:hidden',
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Message requests
        </h1>
      </header>

      {requests.length > 0 ? (
        <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {requests.map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              onAccept={onAccept}
              onDecline={onDecline}
            />
          ))}
        </ul>
      ) : (
        <p className="flex-1 px-3 py-10 text-center text-sm text-slate-400">
          You’re all caught up — no pending requests.
        </p>
      )}
    </section>
  )
}
