import { POST_TYPE_ENUM } from '@/api/posts/posts.enum'
import { Post } from '@/api/posts/posts.types'
import { PostStatus } from '@/types/post'
import {
  countAuthoredBy,
  deriveSpacesFromPosts,
  filterPostsByTab,
} from '@/modules/feed/feed.utils'
import { describe, expect, it } from 'vitest'

const makePost = (overrides: Partial<Post> = {}): Post => ({
  id: 'p1',
  title: 'Title',
  type: POST_TYPE_ENUM.POST,
  createdAt: '2026-06-01T10:00:00.000Z',
  createdBy: 'user-1',
  ...overrides,
})

const textOld = makePost({
  id: 'text-old',
  type: POST_TYPE_ENUM.POST,
  createdAt: '2026-06-01T10:00:00.000Z',
  createdBy: 'user-1',
})
const textNew = makePost({
  id: 'text-new',
  type: POST_TYPE_ENUM.POST,
  createdAt: '2026-06-10T10:00:00.000Z',
  createdBy: 'user-2',
})
const liveSpace = makePost({
  id: 'space-live',
  type: POST_TYPE_ENUM.SPACE,
  status: PostStatus.live,
  createdAt: '2026-06-05T10:00:00.000Z',
  createdBy: 'user-1',
})
const upcomingSpace = makePost({
  id: 'space-upcoming',
  type: POST_TYPE_ENUM.SPACE,
  status: PostStatus.scheduled,
  createdAt: '2026-06-08T10:00:00.000Z',
  createdBy: 'user-1',
})
const endedSpace = makePost({
  id: 'space-ended',
  type: POST_TYPE_ENUM.SPACE,
  status: PostStatus.ended,
  createdAt: '2026-06-02T10:00:00.000Z',
  createdBy: 'user-2',
})

const posts = [textOld, textNew, liveSpace, upcomingSpace, endedSpace]

describe('filterPostsByTab', () => {
  it('returns every post for the "For you" tab', () => {
    expect(filterPostsByTab(posts, 'foryou')).toHaveLength(posts.length)
  })

  it('mirrors "For you" for "Following" until a follow graph exists', () => {
    expect(filterPostsByTab(posts, 'following')).toEqual(
      filterPostsByTab(posts, 'foryou'),
    )
  })

  it('keeps only SPACE posts for the "Spaces" tab', () => {
    const result = filterPostsByTab(posts, 'spaces')
    expect(result.map((p) => p.id)).toEqual([
      'space-live',
      'space-upcoming',
      'space-ended',
    ])
  })

  it('sorts newest-first for the "Latest" tab without mutating input', () => {
    const result = filterPostsByTab(posts, 'latest')
    expect(result.map((p) => p.id)).toEqual([
      'text-new',
      'space-upcoming',
      'space-live',
      'space-ended',
      'text-old',
    ])
    // original order is untouched
    expect(posts[0].id).toBe('text-old')
  })
})

describe('deriveSpacesFromPosts', () => {
  it('splits live and upcoming spaces by status, ignoring ended and text posts', () => {
    const { live, upcoming } = deriveSpacesFromPosts(posts)
    expect(live.map((p) => p.id)).toEqual(['space-live'])
    expect(upcoming.map((p) => p.id)).toEqual(['space-upcoming'])
  })

  it('returns empty buckets when given no posts', () => {
    expect(deriveSpacesFromPosts()).toEqual({ live: [], upcoming: [] })
  })
})

describe('countAuthoredBy', () => {
  it('counts posts and spaces authored by the given user', () => {
    expect(countAuthoredBy(posts, 'user-1')).toEqual({ posts: 3, spaces: 2 })
  })

  it('returns zeroes when the user id is missing', () => {
    expect(countAuthoredBy(posts, undefined)).toEqual({ posts: 0, spaces: 0 })
  })

  it('defaults to an empty posts list', () => {
    expect(countAuthoredBy(undefined, 'user-1')).toEqual({
      posts: 0,
      spaces: 0,
    })
  })
})
