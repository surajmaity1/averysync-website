import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const Chats = lazy(() =>
  import('@/modules/chats').then((m) => ({ default: m.Chats })),
)

function ChatsPage() {
  return <Chats />
}

export const Route = createFileRoute('/_internal/chats')({
  component: ChatsPage,
})
