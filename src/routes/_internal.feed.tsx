import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const Feed = lazy(() =>
  import('@/modules/feed').then((m) => ({ default: m.Feed })),
)

function FeedPage() {
  return <Feed />
}

export const Route = createFileRoute('/_internal/feed')({
  component: FeedPage,
})
