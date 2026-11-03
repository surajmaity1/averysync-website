import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const Chat = lazy(() =>
  import('@/modules/chat').then((m) => ({ default: m.Chat })),
)

type ChatSearch = {
  /** Conversation to open on load — set by the profile "Message" hand-off. */
  c?: string
}

function ChatPage() {
  const { c } = Route.useSearch()
  return <Chat initialConversationId={c} />
}

export const Route = createFileRoute('/_internal/chat')({
  validateSearch: (search: Record<string, unknown>): ChatSearch => ({
    c: typeof search.c === 'string' ? search.c : undefined,
  }),
  component: ChatPage,
})
