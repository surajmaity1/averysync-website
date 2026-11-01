import { cn } from '@/libs/utils'
import { BellOff } from 'lucide-react'
import type { AppNotification } from '../notifications.types'
import type { NotificationGroup } from '../notifications.utils'
import { NotificationItem } from './notification-item'

type NotificationListProps = {
  groups: NotificationGroup[]
  onOpen: (notification: AppNotification) => void
  className?: string
}

/** Shown when the active tab has no notifications. */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
      <BellOff className="h-6 w-6 text-slate-400" />
    </span>
    <h2 className="text-lg font-bold tracking-tight text-slate-900">
      You’re all caught up
    </h2>
    <p className="max-w-xs text-sm text-slate-500">
      New activity — follows, mentions, and Space reminders — will show up here.
    </p>
  </div>
)

/**
 * The grouped notifications feed: a labelled section per time bucket (Today /
 * This week / Earlier), each listing its rows. Renders an empty state when
 * there is nothing to show.
 */
export const NotificationList = ({
  groups,
  onOpen,
  className,
}: NotificationListProps) => {
  if (groups.length === 0) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {groups.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h2 className="px-3 pb-1 text-xs font-bold tracking-wide text-slate-400 uppercase">
            {group.label}
          </h2>
          <div className="space-y-0.5">
            {group.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={onOpen}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
