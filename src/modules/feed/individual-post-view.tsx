import { PostsApi } from '@/api/posts/posts.api'
import { ErrorPage } from '@/components/common/error-page'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, FileQuestion } from 'lucide-react'
import { FeedLayout } from './components/feed-layout'
import { FeedPostCard } from './components/feed-post-card'
import { FeedDetailSkeleton } from './components/feed-skeleton'

type IndividualPostViewProps = {
  postId: string
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

const PostNotFound = () => (
  <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
      <FileQuestion className="h-6 w-6 text-slate-500" />
    </span>
    <h3 className="text-lg font-bold tracking-tight text-slate-900">
      Post not found
    </h3>
    <p className="max-w-sm text-sm text-slate-500">
      This post may have been removed or the link is no longer valid.
    </p>
  </div>
)

/** Center column for `/feed/:postId`: back link + the full post. */
const PostDetail = ({ postId }: IndividualPostViewProps) => {
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: PostsApi.getPostById.key({ postId }),
    queryFn: () => PostsApi.getPostById.fn({ postId }),
  })

  if (isLoading) {
    return <FeedDetailSkeleton />
  }

  if (isError) {
    return <ErrorPage />
  }

  return (
    <>
      <BackToFeed />
      {post?.data ? <FeedPostCard post={post.data} detail /> : <PostNotFound />}
    </>
  )
}

export const IndividualPostView = ({ postId }: IndividualPostViewProps) => {
  return (
    <FeedLayout>
      <PostDetail postId={postId} />
    </FeedLayout>
  )
}
