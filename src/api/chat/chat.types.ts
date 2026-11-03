/**
 * DTOs for direct messaging — mirrors the backend contract in
 * `averysync-backend-internal/docs/05-chat-messaging.md` (the follow-gated
 * message-requests slice).
 */

export type TConversationSection = 'primary' | 'requests'

export type TConversationType = 'DIRECT' | 'GROUP'

/** The caller's own membership state; `PENDING` marks a message request. */
export type TMemberState = 'PENDING' | 'ACCEPTED'

export type TConversationPeer = {
  id: string
  name: string
  image?: string | null
}

/** A conversation row for the inbox / thread header. */
export type TConversationSummary = {
  id: string
  type: TConversationType
  peer?: TConversationPeer | null
  title?: string | null
  state: TMemberState
  lastMessagePreview?: string | null
  lastMessageAt?: string | null
  unreadCount: number
}

export type TConversationDetail = TConversationSummary

export type TMessage = {
  id: string
  conversationId: string
  senderId: string
  type: string
  body?: string | null
  metadata?: Record<string, unknown> | null
  isDeleted: boolean
  createdAt: string
}

/** Cursor-paginated list envelope shared by conversations and message history. */
export type TCursorPage<T> = {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

export type CreateConversationDTO = {
  participantId: string
}

export type SendMessageDTO = {
  conversationId: string
  body: string
  clientMessageId?: string
}

export type ListConversationsDTO = {
  section: TConversationSection
  limit?: number
  cursor?: string | null
}

export type ListMessagesDTO = {
  conversationId: string
  limit?: number
  cursor?: string | null
}
