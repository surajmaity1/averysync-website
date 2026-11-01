import { PostsApi } from '@/api/posts/posts.api'
import { UsersAPI } from '@/api/users/users.api'
import { TUser } from '@/api/users/users.type'
import { ErrorPage } from '@/components/common/error-page'
import { Shimmer } from '@/components/common/shimmer'
import { AvatarUser } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { ChevronLeft, Sparkles, UserX } from 'lucide-react'
import { useMemo } from 'react'
import { FeedLayout } from '../feed/components/feed-layout'
import { FeedPostCard } from '../feed/components/feed-post-card'
import { PostCardSkeleton } from '../feed/components/feed-skeleton'
import { countAuthoredBy } from '../feed/feed.utils'
import { selectPostsByUser } from './profile.utils'

type UserProfileProps = {
  userId: string
}

const BackToFeed = () => (
  <Link
    to="/feed"
    className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
  >
    <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
    Back to feed
  </Link>
)

const Stat = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-lg font-bold text-slate-900">{value}</span>
    <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
      {label}
    </span>
  </div>
)

/** Hero card for `/:userId` — banner, avatar, identity, and post/space counts. */
const ProfileHero = ({
  user,
  stats,
}: {
  user: TUser
  stats: { posts: number; spaces: number }
}) => {
  const handle = user.email ? user.email.split('@')[0] : undefined

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-20 bg-gradient-to-br from-blue-600 to-indigo-600 sm:h-24" />
      <div className="flex flex-col px-5 pb-5 sm:px-6 sm:pb-6">
        <AvatarUser
          src={user.image}
          name={user.name}
          size={88}
          className="-mt-11 ring-4 ring-white"
        />
        <h1 className="mt-3 text-xl font-bold tracking-tight break-words text-slate-900 sm:text-2xl">
          {user.name || 'Averysync member'}
        </h1>
        {handle && (
          <p className="mt-0.5 truncate text-sm text-slate-400">@{handle}</p>
        )}

        <div className="mt-5 flex gap-10 border-t border-slate-100 pt-4 sm:gap-8">
          <Stat value={stats.posts} label="Posts" />
          <Stat value={stats.spaces} label="Spaces" />
        </div>
      </div>
    </section>
  )
}

const ProfileSkeleton = () => (
  <div className="flex flex-col gap-5">
    <Shimmer className="h-10 w-32 rounded-full" />
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <Shimmer className="h-24 rounded-none" />
      <div className="flex flex-col px-6 pb-6">
        <Shimmer className="-mt-11 h-[88px] w-[88px] rounded-full ring-4 ring-white" />
        <Shimmer className="mt-3 h-6 w-48 rounded-full" />
        <Shimmer className="mt-2 h-3.5 w-28 rounded-full" />
        <div className="mt-5 flex gap-8 border-t border-slate-100 pt-4">
          <Shimmer className="h-10 w-16 rounded-xl" />
          <Shimmer className="h-10 w-16 rounded-xl" />
        </div>
      </div>
    </div>
    <PostCardSkeleton />
  </div>
)

const UserNotFound = () => (
  <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
      <UserX className="h-6 w-6 text-slate-500" />
    </span>
    <h3 className="text-lg font-bold tracking-tight text-slate-900">
      User not found
    </h3>
    <p className="max-w-sm text-sm text-slate-500">
      This member may no longer exist or the link is no longer valid.
    </p>
  </div>
)

const EmptyPosts = ({ name }: { name?: string }) => (
  <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
      <Sparkles className="h-6 w-6 text-blue-600" />
    </span>
    <h3 className="text-lg font-bold tracking-tight text-slate-900">
      Nothing shared yet
    </h3>
    <p className="max-w-sm text-sm text-slate-500">
      {name || 'This member'} hasn't posted or hosted a Space yet.
    </p>
  </div>
)

/** Center column for `/:userId`: back link, profile hero, and the user's posts. */
const ProfileDetail = ({ userId }: UserProfileProps) => {
  const navigate = useNavigate()

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: UsersAPI.getUserById.key({ userId }),
    queryFn: () => UsersAPI.getUserById.fn({ userId }),
  })

  const {
    data: postsData,
    isLoading: arePostsLoading,
    isError: arePostsError,
  } = useQuery({
    queryKey: PostsApi.getPosts.key,
    queryFn: () => PostsApi.getPosts.fn(),
  })

  const userPosts = useMemo(
    () => selectPostsByUser(postsData?.posts, userId),
    [postsData?.posts, userId],
  )
  const stats = useMemo(
    () => countAuthoredBy(postsData?.posts, userId),
    [postsData?.posts, userId],
  )

  if (isUserLoading || arePostsLoading) {
    return <ProfileSkeleton />
  }

  const isUserMissing =
    isAxiosError(userError) && userError.response?.status === 404

  if (isUserMissing) {
    return (
      <>
        <BackToFeed />
        <UserNotFound />
      </>
    )
  }

  if (isUserError || arePostsError || !user) {
    return <ErrorPage />
  }

  return (
    <>
      <BackToFeed />
      <ProfileHero user={user} stats={stats} />

      <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
        Posts
      </h2>
      {userPosts.length === 0 ? (
        <EmptyPosts name={user.name} />
      ) : (
        <div className="flex flex-col gap-5">
          {userPosts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              onClick={() =>
                navigate({ to: '/feed/$postId', params: { postId: post.id } })
              }
            />
          ))}
        </div>
      )}
    </>
  )
}

export const UserProfile = ({ userId }: UserProfileProps) => {
  return (
    <FeedLayout>
      <ProfileDetail userId={userId} />
    </FeedLayout>
  )
}
