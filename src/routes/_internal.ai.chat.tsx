import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const AiChat = lazy(() =>
  import('@/modules/ai-chat').then((m) => ({ default: m.AiChat })),
)

function AiChatPage() {
  return <AiChat />
}

export const Route = createFileRoute('/_internal/ai/chat')({
  component: AiChatPage,
})
