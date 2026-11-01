import type { ChatConversation, ChatMessage } from './chat.types'

/** Sender id used for messages authored by the signed-in user. */
export const CURRENT_USER_ID = 'me'

/** The final message in a thread, or `undefined` when it has none yet. */
export const getLastMessage = (
  conversation: ChatConversation,
): ChatMessage | undefined =>
  conversation.messages[conversation.messages.length - 1]

const lastActivity = (conversation: ChatConversation): number => {
  const last = getLastMessage(conversation)
  return last ? new Date(last.sentAt).getTime() : 0
}

/**
 * Conversations ordered by their most recent message, newest first. Empty
 * threads sort last. Never mutates the input (returns a new array).
 */
export const sortConversationsByRecent = (
  conversations: ChatConversation[],
): ChatConversation[] =>
  [...conversations].sort((a, b) => lastActivity(b) - lastActivity(a))

/** Total unread messages across every conversation — for the nav badge. */
export const totalUnreadCount = (conversations: ChatConversation[]): number =>
  conversations.reduce((sum, c) => sum + c.unreadCount, 0)

/**
 * Returns a new conversation with `text` appended as a message. Trims the
 * text; a blank/whitespace message is a no-op and the original conversation is
 * returned unchanged (referentially equal). The original is never mutated.
 */
export const appendMessage = (
  conversation: ChatConversation,
  text: string,
  senderId: string = CURRENT_USER_ID,
  now: Date = new Date(),
): ChatConversation => {
  const trimmed = text.trim()
  if (!trimmed) return conversation

  const message: ChatMessage = {
    id: `${conversation.id}-m${conversation.messages.length + 1}`,
    senderId,
    text: trimmed,
    sentAt: now.toISOString(),
  }

  return { ...conversation, messages: [...conversation.messages, message] }
}

/** Short clock time for a message bubble, e.g. `2:30 PM`. */
export const formatClockTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
