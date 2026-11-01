import { AvatarUser } from '@/components/ui/avatar'
import { cn, formatPostDate } from '@/libs/utils'
import { ChevronRight, MailPlus, Search } from 'lucide-react'
import type { ChatConversation } from '../chat.types'
import { CURRENT_USER_ID, getLastMessage } from '../chat.utils'

type ConversationListProps = {
  conversations: ChatConversation[]
  activeId: string | null
  onSelect: (id: string) => void
  query: string
  onQueryChange: (value: string) => void
  className?: string
  /**
   * Number of pending message requests. When set alongside `onOpenRequests`
   * (and greater than zero) a "Requests" entry appears below the search.
   */
  requestCount?: number
  /** Open the message-requests view. Omit to hide the requests entry entirely. */
  onOpenRequests?: () => void
}

/** Small green presence dot overlaid on an avatar. */
const OnlineDot = () => (
  <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
)

const ConversationRow = ({
  conversation,
  active,
  onSelect,
}: {
  conversation: ChatConversation
  active: boolean
  onSelect: (id: string) => void
}) => {
  const { participant, online, unreadCount } = conversation
  const last = getLastMessage(conversation)
  const preview = last
    ? `${last.senderId === CURRENT_USER_ID ? 'You: ' : ''}${last.text}`
    : 'No messages yet'

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      aria-label={`Open conversation with ${participant.name}`}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors',
        active ? 'bg-blue-50' : 'hover:bg-slate-50',
      )}
    >
      <div className="relative flex-shrink-0">
        <AvatarUser src={participant.image} name={participant.name} size={48} />
        {online && <OnlineDot />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'truncate text-sm font-bold text-slate-900',
              active && 'text-blue-700',
            )}
          >
            {participant.name}
          </span>
          {last && (
            <span className="ml-auto flex-shrink-0 text-[11px] font-medium text-slate-400">
              {formatPostDate(last.sentAt)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span
            className={cn(
              'truncate text-xs',
              unreadCount > 0
                ? 'font-semibold text-slate-700'
                : 'text-slate-500',
            )}
          >
            {preview}
          </span>
          {unreadCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

/**
 * Left pane: searchable list of conversations. On mobile it is the full-screen
 * master view; on desktop it sits beside the thread.
 */
/**
 * "Requests" entry shown below the search — the doorway to the message-requests
 * inbox (people who want to reach the user but aren't connected yet).
 */
const RequestsEntry = ({
  count,
  onOpen,
}: {
  count: number
  onOpen: () => void
}) => (
  <button
    type="button"
    onClick={onOpen}
    aria-label={`Message requests (${count})`}
    className="mt-2 flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-50"
  >
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
      <MailPlus className="h-[18px] w-[18px]" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-slate-900">Requests</p>
      <p className="truncate text-xs text-slate-500">
        {count} {count === 1 ? 'person wants' : 'people want'} to message you
      </p>
    </div>
    <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
      {count}
    </span>
    <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
  </button>
)

export const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  query,
  onQueryChange,
  className,
  requestCount = 0,
  onOpenRequests,
}: ConversationListProps) => {
  const normalized = query.trim().toLowerCase()
  const visible = normalized
    ? conversations.filter((c) =>
        c.participant.name.toLowerCase().includes(normalized),
      )
    : conversations

  return (
    <aside
      className={cn(
        'flex min-h-0 flex-col border-slate-200 bg-white',
        className,
      )}
    >
      <div className="flex-shrink-0 border-b border-slate-100 px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Messages
        </h1>
        <label className="mt-3 flex h-10 items-center gap-2.5 rounded-full border border-transparent bg-slate-100 px-3.5 transition-colors focus-within:border-slate-200 focus-within:bg-white focus-within:shadow-sm">
          <Search className="h-[18px] w-[18px] flex-shrink-0 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search messages"
            aria-label="Search messages"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        {onOpenRequests && requestCount > 0 && (
          <RequestsEntry count={requestCount} onOpen={onOpenRequests} />
        )}
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {visible.length > 0 ? (
          visible.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === activeId}
              onSelect={onSelect}
            />
          ))
        ) : (
          <p className="px-3 py-8 text-center text-sm text-slate-400">
            No conversations match “{query}”.
          </p>
        )}
      </div>
    </aside>
  )
}
