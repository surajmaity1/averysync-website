import { PostsApi } from '@/api/posts/posts.api'
import { ErrorPage } from '@/components/common/error-page'
import { Card } from '@/components/posts/post-card'
import { CardSkeleton } from '@/components/posts/post-skeleton'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

type IndividualPostViewProps = {
  postId: string
}

export const IndividualPostView = ({ postId }: IndividualPostViewProps) => {
  const navigate = useNavigate()
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: PostsApi.getPostById.key({ postId }),
    queryFn: () => PostsApi.getPostById.fn({ postId }),
  })

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-100 p-4">
          <CardSkeleton />
        </div>
      </>
    )
  }

  if (isError) {
    return <ErrorPage />
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto mb-6 max-w-md cursor-pointer">
        <Button
          className="gap-1"
          onClick={() =>
            navigate({
              to: '/feed',
            })
          }
        >
          <ChevronLeft /> <span>Feed</span>
        </Button>
      </div>
      {post?.data && (
        <Card
          key={post.data.id}
          post={post.data}
          className=""
          onClick={() => {}}
        />
      )}
    </div>
  )
}
