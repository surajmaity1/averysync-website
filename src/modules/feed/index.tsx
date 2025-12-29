import { PostsApi } from '@/api/posts/posts.api'
import { ErrorPage } from '@/components/common/error-page'
import { CreatePostButton } from '@/components/posts/create-post-button'
import { Card, EmptyCard } from '@/components/posts/post-card'
import { CardSkeleton } from '@/components/posts/post-skeleton'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'

export const Feed = () => {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_internal/feed' })

  const { data, isLoading, isError } = useQuery({
    queryKey: PostsApi.getPosts.key,
    queryFn: () => PostsApi.getPosts.fn(),
  })

  if (isLoading) {
    return (
      <>
        <div className="mx-auto min-h-screen max-w-2xl pt-24 pb-20">
          <div className="mb-8 px-4">
            <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-200"></div>
          </div>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </>
    )
  }

  if (isError) {
    return <ErrorPage />
  }

  if (!data?.posts || data?.posts.length === 0) {
    return (
      <>
        <EmptyCard />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-end justify-between px-4 sm:px-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Feed
            </h1>
            <p className="mt-1 text-slate-500">
              Catch up on the latest discussions.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-900/5 sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Personalized for you</span>
          </div>
        </div>

        <div className="space-y-6 px-4 sm:px-0">
          {data?.posts?.map((post) => (
            <Card
              key={post?.id}
              post={post}
              className=""
              onClick={() =>
                navigate({
                  to: '/feed/$postId',
                  params: { postId: post.id },
                })
              }
            />
          ))}
        </div>
      </div>

      <CreatePostButton />
    </div>
  )
}
