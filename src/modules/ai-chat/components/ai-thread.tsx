import { copyTextToClipboard } from '@/libs/clipboard'
import { cn } from '@/libs/utils'
import { Copy, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { AI_ASSISTANT_NAME } from '../ai-chat.constants'
import type { AiConversation, AiMessage } from '../ai-chat.types'

type AiThreadProps = {
  conversation: AiConversation
  /** Show the "thinking" indicator under the last message. */
  isThinking: boolean
  className?: string
}

const AssistantAvatar = () => (
  <span
    aria-hidden
    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50"
  >
    <Sparkles className="h-4 w-4 text-blue-600" />
  </span>
)

const MessageRow = ({ message }: { message: AiMessage }) => {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-3xl rounded-br-md bg-blue-600 px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-sm sm:max-w-[70%]">
          <p className="break-words whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    )
  }

  const copyMessage = async () => {
    const copied = await copyTextToClipboard(message.text)
    if (copied) toast.success('Copied to clipboard')
    else toast.error('Copying is not available in this browser')
  }

  return (
    <div className="group flex items-start gap-3">
      <AssistantAvatar />
      <div className="min-w-0 flex-1 pt-1 text-[15px] leading-relaxed text-slate-800">
        <p className="break-words whitespace-pre-wrap">{message.text}</p>
        <button
          type="button"
          aria-label="Copy message"
          onClick={copyMessage}
          className="mt-1.5 flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-xs font-medium text-slate-400 transition-opacity hover:bg-slate-100 hover:text-slate-700 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <Copy className="h-3.5 w-3.5" /> Copy
        </button>
      </div>
    </div>
  )
}

const ThinkingIndicator = () => (
  <div
    role="status"
    aria-label={`${AI_ASSISTANT_NAME} is thinking`}
    className="flex items-center gap-3"
  >
    <AssistantAvatar />
    <span className="flex gap-1 pt-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  </div>
)

/** The open conversation: scrolling turn list that follows the newest message. */
export const AiThread = ({
  conversation,
  isThinking,
  className,
}: AiThreadProps) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [conversation.id, conversation.messages.length, isThinking])

  return (
    <div
      role="log"
      aria-label={`Conversation: ${conversation.title}`}
      className={cn('space-y-5', className)}
    >
      {conversation.messages.map((message) => (
        <MessageRow key={message.id} message={message} />
      ))}
      {isThinking && <ThinkingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}
