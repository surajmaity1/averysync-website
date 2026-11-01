import type { AppNotification } from './notifications.types'

/**
 * Presentational sample notifications for the /notifications page.
 *
 * The product API today exposes only posts and users — there is no
 * notifications endpoint yet. Rather than fabricate API calls, the page renders
 * from this clearly-labelled static module (mirroring `chat.constants.ts` and
 * `feed.constants.ts`). Marking read updates local component state only;
 * nothing is persisted.
 *
 * The `spaceId` values point at real sample posts so a space notification can
 * deep-link into `/feed/$postId`, and `actor.id` values into `/$userId`.
 *
 * ⚠️ Replace with real queries/mutations once a notifications endpoint ships.
 * Nothing here is user-specific or stored.
 */
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * An instant `days` whole UTC days before today, `minutesIntoDay` past that
 * day's UTC midnight. Anchoring to UTC midnight (rather than "now minus N
 * hours") keeps every fixture in a stable Today / This week / Earlier bucket
 * no matter what time of day the app runs — the grouping in
 * `notifications.utils.ts` compares whole UTC days.
 */
const utcDaysAgoIso = (days: number, minutesIntoDay = 0): string =>
  new Date(
    Math.floor(Date.now() / DAY_MS) * DAY_MS -
      days * DAY_MS +
      minutesIntoDay * 60 * 1000,
  ).toISOString()

export const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-diego-live',
    type: 'space_live',
    actor: { id: 'user-diego', name: 'Diego Santos' },
    read: false,
    createdAt: utcDaysAgoIso(0, 2),
    spaceId: 'space-live-1',
    spaceTitle: 'Shipping realtime audio at scale',
  },
  {
    id: 'notif-maya-follow',
    type: 'follow',
    actor: { id: 'user-maya', name: 'Maya Patel' },
    read: false,
    createdAt: utcDaysAgoIso(0, 1),
  },
  {
    id: 'notif-priya-reminder',
    type: 'space_reminder',
    actor: { id: 'user-priya', name: 'Priya Sharma' },
    read: false,
    createdAt: utcDaysAgoIso(1, 60),
    spaceId: 'space-upcoming-1',
    spaceTitle: 'Design tokens deep-dive',
    spaceStartsAt: utcDaysAgoIso(-1, 15 * 60),
  },
  {
    id: 'notif-leo-invite',
    type: 'space_invite',
    actor: { id: 'user-leo', name: 'Leo Nakamura' },
    read: true,
    createdAt: utcDaysAgoIso(2, 30),
    spaceId: 'space-upcoming-2',
    spaceTitle: 'Wake-lock resilience Q&A',
  },
  {
    id: 'notif-aisha-mention',
    type: 'mention',
    actor: { id: 'user-aisha', name: 'Aisha Khan' },
    read: true,
    createdAt: utcDaysAgoIso(3, 15),
    spaceId: 'space-past-1',
    preview: 'Loved your point about backoff — thanks @you for the clarity!',
  },
  {
    id: 'notif-tomas-follow',
    type: 'follow',
    actor: { id: 'user-tomas', name: 'Tomás Rivera' },
    read: true,
    createdAt: utcDaysAgoIso(10, 45),
  },
]
