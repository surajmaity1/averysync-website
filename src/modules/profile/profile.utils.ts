import { Post } from '@/api/posts/posts.types'

const byNewestFirst = (a: Post, b: Post) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

/**
 * Posts authored by the given user, newest first — the profile page stream.
 * There is no per-user posts endpoint yet, so this selects from the full
 * posts list the feed already caches.
 */
export const selectPostsByUser = (
  posts: Post[] = [],
  userId?: string,
): Post[] => {
  if (!userId) return []

  return posts.filter((post) => post.createdBy === userId).sort(byNewestFirst)
}
