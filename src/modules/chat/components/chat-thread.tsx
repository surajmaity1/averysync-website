import { AvatarUser } from '@/components/ui/avatar'
import { cn } from '@/libs/utils'
import { ArrowLeft, Info, Phone, SendHorizontal, Video } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { ChatConversation } from '../chat.types'
import { CURRENT_USER_ID, formatClockTime } from '../chat.utils'

type ChatThreadProps = {
  conversation: ChatConversation | null
  onBack: () => void
  onSend: (text: string) => void
  className?: string
  /**
   * Force the back button to show at every breakpoint. The full-page layout
   * hides it on desktop (the list sits alongside the thread), but the compact
   * floating widget is single-column at all sizes and always needs a way back.
   */
  alwaysShowBack?: boolean
}

const HeaderAction = ({
  icon: Icon,
  label,
}: {
  icon: typeof Phone
  label: string
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={() => toast.info(`${label} coming soon!`)}
    className="hidden h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:flex"
  >
    <Icon className="h-[18px] w-[18px]" />
  </button>
)

const MessageBubble = ({
  text,
  sentAt,
  mine,
}: {
  text: string
  sentAt: string
  mine: boolean
}) => (
  <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
    <div
      className={cn(
        'max-w-[78%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[65%]',
        mine
          ? 'rounded-br-md bg-blue-600 text-white'
          : 'rounded-bl-md border border-slate-200 bg-white text-slate-800',
      )}
    >
      <p className="break-words whitespace-pre-wrap">{text}</p>
      <span
        className={cn(
          'mt-1 block text-right text-[10px] font-medium',
          mine ? 'text-blue-100' : 'text-slate-400',
        )}
      >
        {formatClockTime(sentAt)}
      </span>
    </div>
  </div>
)

/** Empty state shown on desktop before any conversation is chosen. */
const NoConversation = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
      <SendHorizontal className="h-6 w-6 text-blue-600" />
    </span>
    <h2 className="text-lg font-bold tracking-tight text-slate-900">
      Your messages
    </h2>
    <p className="max-w-xs text-sm text-slate-500">
      Select a conversation to start chatting with the community.
    </p>
  </div>
)

/**
 * Right pane: the active conversation thread — header, scrolling message list,
 * and the composer. On mobile it is the full-screen detail view.
 */
export const ChatThread = ({
  conversation,
  onBack,
  onSend,
  className,
  alwaysShowBack = false,
}: ChatThreadProps) => {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Clear the draft when switching conversations.
  useEffect(() => {
    setDraft('')
  }, [conversation?.id])

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [conversation?.id, conversation?.messages.length])

  if (!conversation) {
    return (
      <section
        aria-label="Your messages"
        className={cn('min-h-0 flex-col bg-slate-50', className)}
      >
        <NoConversation />
      </section>
    )
  }

  const { participant, online } = conversation

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    onSend(draft)
    setDraft('')
  }

  return (
    <section
      aria-label={`Conversation with ${participant.name}`}
      className={cn('flex min-h-0 flex-col bg-slate-50', className)}
    >
      {/* Header */}
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-3 py-3 sm:px-4">
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

        <div className="relative flex-shrink-0">
          <AvatarUser
            src={participant.image}
            name={participant.name}
            size={40}
          />
          {online && (
            <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">
            {participant.name}
          </p>
          <p className="truncate text-xs text-slate-400">
            {online ? 'Active now' : participant.role}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <HeaderAction icon={Phone} label="Voice call" />
          <HeaderAction icon={Video} label="Video call" />
          <HeaderAction icon={Info} label="Conversation details" />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-6">
        {conversation.messages.map((message) => (
          <MessageBubble
            key={message.id}
            text={message.text}
            sentAt={message.sentAt}
            mine={message.senderId === CURRENT_USER_ID}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-shrink-0 items-center gap-2 border-t border-slate-100 bg-white px-3 py-3 sm:px-4"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message ${participant.name.split(' ')[0]}`}
          aria-label="Message"
          className="h-11 min-w-0 flex-1 rounded-full bg-slate-100 px-4 text-sm text-slate-900 transition-colors outline-none placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-200"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!draft.trim()}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </form>
    </section>
  )
}
