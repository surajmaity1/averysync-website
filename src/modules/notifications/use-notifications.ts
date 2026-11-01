import { useMemo, useState } from 'react'
import { SAMPLE_NOTIFICATIONS } from './notifications.constants'
import type { AppNotification } from './notifications.types'
import {
  filterNotifications,
  groupNotificationsByTime,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotificationCount,
  type NotificationGroup,
  type NotificationTabKey,
} from './notifications.utils'

/**
 * Presentational state for the notifications page.
 *
 * There is no notifications backend yet (see `notifications.constants`), so this
 * owns the sample list and the read/unread bookkeeping locally. It mirrors
 * `useChatState`: a plain hook so the logic is unit-testable in isolation.
 */
export type NotificationsState = {
  /** The active-tab notifications, bucketed by time (newest first). */
  groups: NotificationGroup[]
  /** True when the active tab has nothing to show. */
  isEmpty: boolean
  /** Unread count across ALL notifications (not just the active tab). */
  unreadCount: number
  activeTab: NotificationTabKey
  setActiveTab: (tab: NotificationTabKey) => void
  /** Mark a single notification read. */
  markRead: (id: string) => void
  /** Mark every notification read. */
  markAllRead: () => void
}

export const useNotifications = (
  initial: AppNotification[] = SAMPLE_NOTIFICATIONS,
): NotificationsState => {
  const [notifications, setNotifications] = useState<AppNotification[]>(
    () => initial,
  )
  const [activeTab, setActiveTab] = useState<NotificationTabKey>('all')

  const unreadCount = useMemo(
    () => unreadNotificationCount(notifications),
    [notifications],
  )

  const groups = useMemo(
    () =>
      groupNotificationsByTime(filterNotifications(notifications, activeTab)),
    [notifications, activeTab],
  )

  const markRead = (id: string) =>
    setNotifications((prev) => markNotificationRead(prev, id))

  const markAllRead = () =>
    setNotifications((prev) => markAllNotificationsRead(prev))

  return {
    groups,
    isEmpty: groups.length === 0,
    unreadCount,
    activeTab,
    setActiveTab,
    markRead,
    markAllRead,
  }
}
