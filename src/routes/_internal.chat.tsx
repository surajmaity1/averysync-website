import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const Chat = lazy(() =>
  import('@/modules/chat').then((m) => ({ default: m.Chat })),
)

function ChatPage() {
  return <Chat />
}

export const Route = createFileRoute('/_internal/chat')({
  component: ChatPage,
})
