import { IndividualPostView } from '@/modules/feed/individual-post-view'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_internal/feed/$postId')({
  component: PostLayout,
})

function PostLayout() {
  const { postId } = Route.useParams()

  return (
    <div>
      <IndividualPostView postId={postId} />
      <div>
        <Outlet />
      </div>
    </div>
  )
}
