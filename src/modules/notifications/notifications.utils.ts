import type { AppNotification, NotificationType } from './notifications.types'

/** Filter tabs shown above the notifications list. */
export const NOTIFICATION_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
] as const

export type NotificationTabKey = (typeof NOTIFICATION_TABS)[number]['key']

/** Time buckets a notification can fall into, in display order. */
const TIME_BUCKETS = ['Today', 'This week', 'Earlier'] as const
export type NotificationGroupLabel = (typeof TIME_BUCKETS)[number]

export type NotificationGroup = {
  label: NotificationGroupLabel
  items: AppNotification[]
}

const timestamp = (n: AppNotification): number =>
  new Date(n.createdAt).getTime()

/**
 * Notifications ordered by their timestamp, newest first. Never mutates the
 * input (returns a new array).
 */
export const sortNotificationsByRecent = (
  notifications: AppNotification[],
): AppNotification[] =>
  [...notifications].sort((a, b) => timestamp(b) - timestamp(a))

/** How many notifications are unread — for the nav badge. */
export const unreadNotificationCount = (
  notifications: AppNotification[],
): number => notifications.reduce((sum, n) => sum + (n.read ? 0 : 1), 0)

/**
 * Returns a new list with the notification `id` marked read. The original is
 * never mutated; an unknown id is a no-op (returns an equal list).
 */
export const markNotificationRead = (
  notifications: AppNotification[],
  id: string,
): AppNotification[] =>
  notifications.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n))

/** Returns a new list with every notification marked read. */
export const markAllNotificationsRead = (
  notifications: AppNotification[],
): AppNotification[] =>
  notifications.map((n) => (n.read ? n : { ...n, read: true }))

/** Notifications visible under the active tab. */
export const filterNotifications = (
  notifications: AppNotification[],
  tab: NotificationTabKey,
): AppNotification[] =>
  tab === 'unread' ? notifications.filter((n) => !n.read) : notifications

const ACTION_TEXT: Record<NotificationType, string> = {
  follow: 'started following you',
  space_reminder: 'scheduled an upcoming Space',
  space_live: 'is live now',
  space_invite: 'invited you to their Space',
  mention: 'mentioned you',
}

/** The phrase shown after the actor's name, e.g. "started following you". */
export const notificationActionText = (n: AppNotification): string =>
  ACTION_TEXT[n.type]

/** Whole UTC days between two instants (positive when `later` is after `iso`). */
const utcDayDiff = (later: Date, iso: string): number => {
  const day = 24 * 60 * 60 * 1000
  return (
    Math.floor(later.getTime() / day) -
    Math.floor(new Date(iso).getTime() / day)
  )
}

const bucketFor = (n: AppNotification, now: Date): NotificationGroupLabel => {
  const diff = utcDayDiff(now, n.createdAt)
  if (diff <= 0) return 'Today'
  if (diff <= 7) return 'This week'
  return 'Earlier'
}

/**
 * Groups notifications into Today / This week / Earlier buckets (in that order,
 * skipping any that are empty). Each bucket is sorted newest first.
 */
export const groupNotificationsByTime = (
  notifications: AppNotification[],
  now: Date = new Date(),
): NotificationGroup[] => {
  const sorted = sortNotificationsByRecent(notifications)
  return TIME_BUCKETS.map((label) => ({
    label,
    items: sorted.filter((n) => bucketFor(n, now) === label),
  })).filter((group) => group.items.length > 0)
}
