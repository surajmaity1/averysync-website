import { MessageCircle } from 'lucide-react'
import { useMessageActions } from '../use-message-actions'

type MessageButtonProps = {
  userId: string
}

/**
 * Opens a DM with the profile's user. Rendered only when the viewer follows
 * this account (relationship `FOLLOWING`) — the entry point to messaging.
 */
export const MessageButton = ({ userId }: MessageButtonProps) => {
  const { message, isStarting } = useMessageActions()

  return (
    <button
      type="button"
      disabled={isStarting}
      onClick={() => message(userId)}
      className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <MessageCircle className="h-4 w-4" />
      Message
    </button>
  )
}
