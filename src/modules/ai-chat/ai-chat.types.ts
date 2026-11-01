/** Who authored a message in an AI conversation. */
export type AiRole = 'user' | 'assistant'

/** A single turn in an AI conversation. */
export type AiMessage = {
  id: string
  role: AiRole
  text: string
  /** ISO 8601 timestamp. */
  sentAt: string
}

/** One assistant conversation, newest activity tracked via `updatedAt`. */
export type AiConversation = {
  id: string
  /** Short label shown in the sidebar; derived from the first prompt. */
  title: string
  /** ISO 8601 timestamps. */
  createdAt: string
  updatedAt: string
  messages: AiMessage[]
}

/** A sidebar recency bucket (Today, Yesterday, …). */
export type AiConversationGroup = {
  label: 'Today' | 'Yesterday' | 'Previous 7 days' | 'Older'
  conversations: AiConversation[]
}
