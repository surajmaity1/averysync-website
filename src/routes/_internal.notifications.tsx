import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const Notifications = lazy(() =>
  import('@/modules/notifications').then((m) => ({ default: m.Notifications })),
)

function NotificationsPage() {
  return <Notifications />
}

export const Route = createFileRoute('/_internal/notifications')({
  component: NotificationsPage,
})
