import { useMemo, useState } from 'react'
import { SAMPLE_CONVERSATIONS, SAMPLE_MESSAGE_REQUESTS } from './chat.constants'
import type { ChatConversation } from './chat.types'
import {
  appendMessage,
  sortConversationsByRecent,
  totalUnreadCount,
} from './chat.utils'

/**
 * The presentational chat state shared by every surface that renders
 * conversations — the full `/chat` page and the app-wide floating widget.
 *
 * It owns the sample conversations, the active thread, the search query, and
 * the read/unread bookkeeping. There is no messaging backend yet, so sending a
 * message updates local state only (see `chat.constants`). Each mounted surface
 * gets its own independent instance; they are never visible at the same time,
 * so they never need to share a single source of truth.
 */
export type ChatState = {
  /** Conversations ordered by most-recent activity, newest first. */
  conversations: ChatConversation[]
  activeId: string | null
  activeConversation: ChatConversation | null
  /** Total unread messages across every conversation — for the launcher badge. */
  unreadTotal: number
  /** People who want to message the user but aren't connected yet. */
  requests: ChatConversation[]
  /** Number of pending message requests — for the "Requests" badge. */
  requestCount: number
  query: string
  setQuery: (value: string) => void
  /** Open a thread and mark it read. */
  openConversation: (id: string) => void
  /** Return to the conversation list. */
  closeConversation: () => void
  /** Append a message to the active thread (trimmed; blank is a no-op). */
  sendMessage: (text: string) => void
  /** Promote a request into a conversation and open it. Unknown id is a no-op. */
  acceptRequest: (id: string) => void
  /** Dismiss a request without connecting. Unknown id is a no-op. */
  declineRequest: (id: string) => void
}

export const useChatState = (
  initialConversations: ChatConversation[] = SAMPLE_CONVERSATIONS,
  initialRequests: ChatConversation[] = SAMPLE_MESSAGE_REQUESTS,
): ChatState => {
  const [conversations, setConversations] = useState<ChatConversation[]>(
    () => initialConversations,
  )
  const [requests, setRequests] = useState<ChatConversation[]>(
    () => initialRequests,
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const ordered = useMemo(
    () => sortConversationsByRecent(conversations),
    [conversations],
  )
  const unreadTotal = useMemo(
    () => totalUnreadCount(conversations),
    [conversations],
  )

  const activeConversation = ordered.find((c) => c.id === activeId) ?? null

  const openConversation = (id: string) => {
    setActiveId(id)
    // An open conversation is a read conversation.
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
    )
  }

  const closeConversation = () => setActiveId(null)

  const sendMessage = (text: string) => {
    if (!activeId) return
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? appendMessage(c, text) : c)),
    )
  }

  const acceptRequest = (id: string) => {
    const request = requests.find((r) => r.id === id)
    if (!request) return
    setRequests((prev) => prev.filter((r) => r.id !== id))
    // A newly accepted request becomes a read, open conversation.
    setConversations((prev) => [{ ...request, unreadCount: 0 }, ...prev])
    setActiveId(id)
  }

  const declineRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  return {
    conversations: ordered,
    activeId,
    activeConversation,
    unreadTotal,
    requests,
    requestCount: requests.length,
    query,
    setQuery,
    openConversation,
    closeConversation,
    sendMessage,
    acceptRequest,
    declineRequest,
  }
}
