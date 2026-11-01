import { AvatarUser } from '@/components/ui/avatar'
import { cn, formatPostDate } from '@/libs/utils'
import {
  AtSign,
  CalendarClock,
  Radio,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { AppNotification, NotificationType } from '../notifications.types'
import { notificationActionText } from '../notifications.utils'

type NotificationItemProps = {
  notification: AppNotification
  onOpen: (notification: AppNotification) => void
}

/** Icon + accent colour for the small badge overlaid on the actor avatar. */
const TYPE_BADGE: Record<
  NotificationType,
  { icon: LucideIcon; className: string }
> = {
  follow: { icon: UserPlus, className: 'bg-blue-600' },
  space_reminder: { icon: CalendarClock, className: 'bg-indigo-500' },
  space_live: { icon: Radio, className: 'bg-rose-500' },
  space_invite: { icon: Users, className: 'bg-emerald-500' },
  mention: { icon: AtSign, className: 'bg-violet-500' },
}

const formatSpaceStart = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

/** Small contextual chip under the message (live status / start time). */
const ContextChip = ({ notification }: { notification: AppNotification }) => {
  if (notification.type === 'space_live') {
    return (
      <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
        Live now
      </span>
    )
  }
  if (notification.type === 'space_reminder' && notification.spaceStartsAt) {
    return (
      <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
        <CalendarClock className="h-3 w-3" />
        Starts {formatSpaceStart(notification.spaceStartsAt)}
      </span>
    )
  }
  return null
}

/**
 * A single notification row: the actor's avatar (badged with a type icon), the
 * activity line, contextual detail, and a timestamp. Unread rows are tinted and
 * carry a dot. Clicking opens the related surface and marks it read.
 */
export const NotificationItem = ({
  notification,
  onOpen,
}: NotificationItemProps) => {
  const { actor, read, type } = notification
  const badge = TYPE_BADGE[type]
  const BadgeIcon = badge.icon

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      aria-label={`${actor.name} ${notificationActionText(notification)}`}
      className={cn(
        'flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors',
        read ? 'hover:bg-slate-50' : 'bg-blue-50/60 hover:bg-blue-50',
      )}
    >
      <div className="relative flex-shrink-0">
        <AvatarUser src={actor.image} name={actor.name} size={44} />
        <span
          className={cn(
            'absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-white',
            badge.className,
          )}
        >
          <BadgeIcon className="h-3 w-3" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-700">
          <span className="font-bold text-slate-900">{actor.name}</span>{' '}
          {notificationActionText(notification)}
        </p>

        {notification.spaceTitle && (
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
            {notification.spaceTitle}
          </p>
        )}

        {notification.preview && (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
            “{notification.preview}”
          </p>
        )}

        <ContextChip notification={notification} />
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
        <span className="text-[11px] font-medium text-slate-400">
          {formatPostDate(notification.createdAt)}
        </span>
        {!read && (
          <span
            aria-label="Unread"
            className="h-2.5 w-2.5 rounded-full bg-blue-600"
          />
        )}
      </div>
    </button>
  )
}
