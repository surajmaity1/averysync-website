import { cn } from '@/libs/utils'
import { useUnreadMessages } from '../use-unread-messages'

type MessageUnreadBadgeProps = {
  /** Extra positioning classes for the host icon (defaults to top-right). */
  className?: string
}

/**
 * Count badge for a message icon: the number of people with unread messages
 * (1 per sender). Renders nothing at zero. The host element must be
 * `position: relative` (or otherwise a positioned ancestor).
 */
export const MessageUnreadBadge = ({ className }: MessageUnreadBadgeProps) => {
  const { count } = useUnreadMessages()

  if (count <= 0) return null

  return (
    <span
      aria-label={`${count} unread ${count === 1 ? 'conversation' : 'conversations'}`}
      className={cn(
        'absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white',
        className,
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
