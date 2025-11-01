import { PostsApi } from '@/api/posts/posts.api'
import { ErrorPage } from '@/components/common/error-page'
import { CreatePostButton } from '@/components/posts/create-post-button'
import { Card, EmptyCard } from '@/components/posts/post-card'
import { CardSkeleton } from '@/components/posts/post-skeleton'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'

export const Feed = () => {
  const search = useSearch({ from: '/_internal/feed' })

  const { data, isLoading, isError } = useQuery({
    queryKey: PostsApi.getPosts.key,
    queryFn: () => PostsApi.getPosts.fn(),
  })

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-100 p-4">
          <h1 className="mb-6 text-3xl font-extrabold text-gray-900">Feed</h1>
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
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="mb-6 text-3xl font-extrabold text-gray-900">Feed</h1>

      <div className="space-y-6">
        {data?.posts?.map((post) => (
          <Card key={post.id} className="" post={post} />
        ))}
      </div>

      <CreatePostButton />
    </div>
  )
}
