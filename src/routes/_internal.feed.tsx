import { createFileRoute, Outlet } from '@tanstack/react-router'

function FeedPage() {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export const Route = createFileRoute('/_internal/feed')({
  component: FeedPage,
})
