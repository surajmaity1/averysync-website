import type { TConversationSummary, TMessage } from '@/api/chat/chat.types'
import type { ChatConversation, ChatMessage } from './chat.types'
import { CURRENT_USER_ID } from './chat.utils'

/**
 * Adapters from the backend DM contract to the presentational shapes the chat
 * components already consume. The signed-in user's messages are re-tagged with
 * `CURRENT_USER_ID` so the existing `senderId === CURRENT_USER_ID` checks keep
 * working. Presence (`online`) and `role` have no v1 backend source.
 */

const DELETED_PLACEHOLDER = 'This message was deleted'

export const toChatMessage = (
  message: TMessage,
  currentUserId: string,
): ChatMessage => ({
  id: message.id,
  senderId:
    message.senderId === currentUserId ? CURRENT_USER_ID : message.senderId,
  text: message.isDeleted ? DELETED_PLACEHOLDER : (message.body ?? ''),
  sentAt: message.createdAt,
})

const participantOf = (summary: TConversationSummary) => ({
  id: summary.peer?.id ?? summary.id,
  name: summary.peer?.name ?? summary.title ?? 'Conversation',
  role: '',
  image: summary.peer?.image ?? undefined,
})

/**
 * Inbox row: no full history, just a synthetic "last message" from the
 * denormalized preview so the list shows text + timestamp and sorts correctly.
 */
export const toConversationListItem = (
  summary: TConversationSummary,
): ChatConversation => ({
  id: summary.id,
  participant: participantOf(summary),
  online: false,
  unreadCount: summary.unreadCount,
  messages: summary.lastMessagePreview
    ? [
        {
          id: `${summary.id}-preview`,
          senderId: summary.peer?.id ?? summary.id,
          text: summary.lastMessagePreview,
          sentAt: summary.lastMessageAt ?? new Date(0).toISOString(),
        },
      ]
    : [],
})

/** Full thread: real message history, oldest-first for top-to-bottom render. */
export const toConversationThread = (
  summary: TConversationSummary,
  messages: TMessage[],
  currentUserId: string,
): ChatConversation => ({
  id: summary.id,
  participant: participantOf(summary),
  online: false,
  unreadCount: summary.unreadCount,
  messages: [...messages]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((message) => toChatMessage(message, currentUserId)),
})
