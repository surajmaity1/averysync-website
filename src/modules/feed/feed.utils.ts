import { Post } from '@/api/posts/posts.types'
import { POST_TYPE_ENUM } from '@/api/posts/posts.enum'
import { PostStatus } from '@/types/post'

/**
 * Feed filter tabs shown above the stream.
 *
 * `following` has no backend (there is no follow graph yet), so it currently
 * mirrors `foryou`. It is kept as a tab to match the design system and to
 * leave an obvious wiring point once the API exists — it never fabricates a
 * personalised result.
 */
export const FEED_TABS = [
  { key: 'foryou', label: 'For you' },
  { key: 'following', label: 'Following' },
  { key: 'spaces', label: 'Spaces' },
  { key: 'latest', label: 'Latest' },
] as const

export type FeedTabKey = (typeof FEED_TABS)[number]['key']

const byNewestFirst = (a: Post, b: Post) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

/**
 * Client-side filtering of the real posts list for the active tab. Only uses
 * fields the API actually returns (`type`, `createdAt`).
 */
export const filterPostsByTab = (posts: Post[], tab: FeedTabKey): Post[] => {
  switch (tab) {
    case 'spaces':
      return posts.filter((post) => post.type === POST_TYPE_ENUM.SPACE)
    case 'latest':
      return [...posts].sort(byNewestFirst)
    case 'foryou':
    case 'following':
    default:
      return posts
  }
}

/**
 * Spaces derived from the *real* posts list for the right rail.
 *
 * `live`   → SPACE posts currently broadcasting (status === LIVE)
 * `upcoming` → SPACE posts that are scheduled (status === scheduled)
 *
 * No counts (listeners/reminders) are invented here — the rail rows render
 * only what the API provides.
 */
export const deriveSpacesFromPosts = (posts: Post[] = []) => {
  const spaces = posts.filter((post) => post.type === POST_TYPE_ENUM.SPACE)

  return {
    live: spaces.filter((post) => post.status === PostStatus.live),
    upcoming: spaces.filter((post) => post.status === PostStatus.scheduled),
  }
}

/** Posts authored by the given user — used for the profile card stat counts. */
export const countAuthoredBy = (posts: Post[] = [], userId?: string) => {
  if (!userId) return { posts: 0, spaces: 0 }

  const mine = posts.filter((post) => post.createdBy === userId)
  return {
    posts: mine.length,
    spaces: mine.filter((post) => post.type === POST_TYPE_ENUM.SPACE).length,
  }
}
