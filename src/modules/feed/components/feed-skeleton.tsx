import { Shimmer } from '@/components/common/shimmer'

/** Loading placeholder for a single stream card. */
export const PostCardSkeleton = () => (
  <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center gap-3">
      <Shimmer className="h-11 w-11 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Shimmer className="h-3.5 w-40 rounded-full" />
        <Shimmer className="h-3 w-24 rounded-full" />
      </div>
    </div>
    <Shimmer className="mb-3 h-5 w-3/4 rounded-full" />
    <div className="flex flex-col gap-2">
      <Shimmer className="h-4 w-full rounded-full" />
      <Shimmer className="h-4 w-5/6 rounded-full" />
    </div>
  </article>
)

/**
 * Center-column loading state — mirrors the composer + stream layout so the
 * page does not reflow once real posts arrive.
 */
export const FeedSkeleton = () => {
  return (
    <div className="flex flex-col gap-5">
      {/* Composer */}
      <div className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <Shimmer className="h-11 w-11 rounded-full" />
        <div className="flex flex-1 flex-col gap-4">
          <Shimmer className="h-12 w-full rounded-full" />
          <div className="flex items-center justify-between">
            <Shimmer className="h-8 w-40 rounded-full" />
            <Shimmer className="h-9 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stream */}
      {[...Array(4)].map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  )
}

/** Center-column loading state for the single post view (`/feed/:postId`). */
export const FeedDetailSkeleton = () => {
  return (
    <div className="flex flex-col gap-5">
      <Shimmer className="h-10 w-32 rounded-full" />
      <PostCardSkeleton />
    </div>
  )
}
