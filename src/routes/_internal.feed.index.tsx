import { Feed } from '@/modules/feed'
import { createFileRoute } from '@tanstack/react-router'

function FeedPage() {
  return <Feed />
}

export const Route = createFileRoute('/_internal/feed/')({
  component: FeedPage,
})
