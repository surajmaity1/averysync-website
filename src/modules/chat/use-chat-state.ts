import { ChatApi } from '@/api/chat/chat.api'
import type { TConversationSummary } from '@/api/chat/chat.types'
import { useAuth } from '@/hooks/useAuth'
import { messageOf } from '@/libs/api-error'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { toConversationListItem, toConversationThread } from './chat.mappers'
import type { ChatConversation } from './chat.types'
import { sortConversationsByRecent, totalUnreadCount } from './chat.utils'

/**
 * Chat state for every surface that renders conversations — the full `/chat`
 * page and the app-wide floating widget. Backed by the messaging REST API
 * (`ChatApi`): the Primary and Requests inboxes are queries; sending, accepting,
 * and declining are mutations that invalidate the affected queries so the UI
 * re-syncs from the backend (the single source of truth for the follow-gated
 * membership state). Each mounted surface gets its own instance; React Query's
 * cache keeps them consistent.
 */
export type ChatState = {
  /** Primary (accepted) conversations, newest activity first. */
  conversations: ChatConversation[]
  activeId: string | null
  activeConversation: ChatConversation | null
  /** Total unread messages — for the launcher badge (0 until read receipts). */
  unreadTotal: number
  /** People who messaged the user but aren't connected yet (PENDING). */
  requests: ChatConversation[]
  /** Number of pending message requests — for the "Requests" badge. */
  requestCount: number
  query: string
  setQuery: (value: string) => void
  /** Open a thread. */
  openConversation: (id: string) => void
  /** Return to the conversation list. */
  closeConversation: () => void
  /** Send a message to the active thread (trimmed; blank is a no-op). */
  sendMessage: (text: string) => void
  /** Accept a message request, promoting it to Primary, and open it. */
  acceptRequest: (id: string) => void
  /** Decline a message request without connecting. */
  declineRequest: (id: string) => void
}

export const useChatState = (): ChatState => {
  const { user } = useAuth()
  const currentUserId = user.id
  const queryClient = useQueryClient()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const primaryQuery = useQuery({
    queryKey: ChatApi.listConversations.key('primary'),
    queryFn: () => ChatApi.listConversations.fn({ section: 'primary' }),
  })
  const requestsQuery = useQuery({
    queryKey: ChatApi.listConversations.key('requests'),
    queryFn: () => ChatApi.listConversations.fn({ section: 'requests' }),
  })

  const primarySummaries = useMemo(
    () => primaryQuery.data?.data ?? [],
    [primaryQuery.data],
  )
  const requestSummaries = useMemo(
    () => requestsQuery.data?.data ?? [],
    [requestsQuery.data],
  )

  const conversations = useMemo(
    () =>
      sortConversationsByRecent(primarySummaries.map(toConversationListItem)),
    [primarySummaries],
  )
  const requests = useMemo(
    () => requestSummaries.map(toConversationListItem),
    [requestSummaries],
  )

  // Active thread: full history + a detail fallback that covers a freshly
  // created DM the inbox lists haven't picked up yet (profile → chat hand-off).
  const messagesQuery = useQuery({
    queryKey: ChatApi.listMessages.key(activeId ?? ''),
    queryFn: () => ChatApi.listMessages.fn({ conversationId: activeId! }),
    enabled: !!activeId,
  })
  const detailQuery = useQuery({
    queryKey: ChatApi.getConversation.key(activeId ?? ''),
    queryFn: () => ChatApi.getConversation.fn(activeId!),
    enabled: !!activeId,
  })

  const activeSummary: TConversationSummary | undefined = useMemo(() => {
    if (!activeId) return undefined
    return (
      [...primarySummaries, ...requestSummaries].find(
        (summary) => summary.id === activeId,
      ) ?? detailQuery.data
    )
  }, [activeId, primarySummaries, requestSummaries, detailQuery.data])

  const activeConversation = useMemo(() => {
    if (!activeId || !activeSummary) return null
    return toConversationThread(
      activeSummary,
      messagesQuery.data?.data ?? [],
      currentUserId,
    )
  }, [activeId, activeSummary, messagesQuery.data, currentUserId])

  const invalidateInboxes = () => {
    void queryClient.invalidateQueries({
      queryKey: ChatApi.listConversations.key('primary'),
    })
    void queryClient.invalidateQueries({
      queryKey: ChatApi.listConversations.key('requests'),
    })
  }

  const invalidateUnread = () =>
    void queryClient.invalidateQueries({ queryKey: ChatApi.unreadCount.key })

  const onError = (error: unknown) => toast.error(messageOf(error))

  // Opening a conversation clears its unread counter, dropping the message-icon
  // badge. Fire-and-forget: failure just leaves the badge until the next poll.
  const markReadMutation = useMutation({
    mutationFn: (id: string) => ChatApi.markRead.fn(id),
    onSuccess: () => {
      invalidateUnread()
      invalidateInboxes()
    },
  })

  const openConversation = (id: string) => {
    setActiveId(id)
    markReadMutation.mutate(id)
  }

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      ChatApi.sendMessage.fn({ conversationId: activeId!, body }),
    onSuccess: () => {
      if (activeId) {
        void queryClient.invalidateQueries({
          queryKey: ChatApi.listMessages.key(activeId),
        })
      }
      invalidateInboxes()
    },
    onError,
  })

  const acceptMutation = useMutation({
    mutationFn: (id: string) => ChatApi.acceptRequest.fn(id),
    onSuccess: (_data, id) => {
      invalidateInboxes()
      invalidateUnread()
      openConversation(id)
    },
    onError,
  })

  const declineMutation = useMutation({
    mutationFn: (id: string) => ChatApi.declineRequest.fn(id),
    onSuccess: invalidateInboxes,
    onError,
  })

  const sendMessage = (text: string) => {
    if (!activeId || !text.trim()) return
    sendMutation.mutate(text.trim())
  }

  return {
    conversations,
    activeId,
    activeConversation,
    unreadTotal: totalUnreadCount(conversations),
    requests,
    requestCount: requests.length,
    query,
    setQuery,
    openConversation,
    closeConversation: () => setActiveId(null),
    sendMessage,
    acceptRequest: (id: string) => acceptMutation.mutate(id),
    declineRequest: (id: string) => declineMutation.mutate(id),
  }
}
