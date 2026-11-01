import { cn } from '@/libs/utils'
import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AI_ASSISTANT_NAME } from '../ai-chat.constants'

type AiComposerProps = {
  onSend: (text: string) => void
  /** Blocks sending while the assistant is answering. */
  disabled?: boolean
  /**
   * Externally injected draft (prompt-suggestion chips). The `key` bumps on
   * every injection so re-picking the same chip still resets the draft.
   */
  seed?: { text: string; key: number }
  /** Focus the textarea on mount. */
  autoFocus?: boolean
  /** Refocus the textarea whenever this value changes (active thread id). */
  focusKey?: string | null
  className?: string
}

const MAX_TEXTAREA_HEIGHT_PX = 200

/**
 * The prompt box: an auto-growing textarea inside a rounded panel with the
 * assistant name and a send button. Enter sends, Shift+Enter adds a newline.
 * Shared by the empty-state hero and the open thread.
 */
export const AiComposer = ({
  onSend,
  disabled = false,
  seed,
  autoFocus = false,
  focusKey,
  className,
}: AiComposerProps) => {
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Keep the prompt box ready for typing when the surface appears or the
  // user switches threads — matching the "always ready to ask" feel. Desktop
  // only: autofocus on a phone pops the keyboard over the page.
  useEffect(() => {
    if (!window.matchMedia('(min-width: 768px)').matches) return
    if (autoFocus || focusKey !== undefined) textareaRef.current?.focus()
  }, [autoFocus, focusKey])

  // A suggestion chip replaces the draft and focuses the box for editing.
  useEffect(() => {
    if (!seed) return
    setDraft(seed.text)
    textareaRef.current?.focus()
  }, [seed])

  // Grow with content up to a cap, then scroll.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`
  }, [draft])

  const submit = () => {
    if (disabled || !draft.trim()) return
    onSend(draft)
    setDraft('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className={cn(
        'shadow-card focus-within:shadow-soft rounded-3xl border border-slate-200 bg-white p-3 transition-shadow focus-within:border-blue-200',
        className,
      )}
    >
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={`Message ${AI_ASSISTANT_NAME}…`}
        aria-label="Message the assistant"
        className="max-h-[200px] w-full resize-none bg-transparent px-1 py-1.5 text-[15px] leading-relaxed text-slate-900 outline-none placeholder:text-slate-400"
      />
      <div className="flex items-center justify-between pt-1">
        <span className="px-1 text-xs font-medium text-slate-400">
          {AI_ASSISTANT_NAME}
        </span>
        <button
          type="submit"
          aria-label="Send prompt"
          disabled={disabled || !draft.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </form>
  )
}
