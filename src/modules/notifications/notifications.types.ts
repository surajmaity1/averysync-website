/** The kinds of activity that surface on the notifications page. */
export type NotificationType =
  | 'follow' // someone started following you
  | 'space_reminder' // an upcoming Space you're reminded about
  | 'space_live' // a Space you follow just went live
  | 'space_invite' // you were invited to a Space
  | 'mention' // someone mentioned you

/** The person whose action produced a notification. */
export type NotificationActor = {
  id: string
  name: string
  image?: string
}

/** A single notification shown in the activity feed. */
export type AppNotification = {
  id: string
  type: NotificationType
  actor: NotificationActor
  read: boolean
  /** ISO 8601 timestamp of when the notification occurred. */
  createdAt: string
  /** Space context — present for every `space_*` type. */
  spaceId?: string
  spaceTitle?: string
  /** ISO 8601 start time, present for an upcoming (`space_reminder`) Space. */
  spaceStartsAt?: string
  /** Free-text context, e.g. the snippet for a `mention`. */
  preview?: string
}
