/** A person the current user is chatting with. */
export type ChatParticipant = {
  id: string
  name: string
  /** Short subtitle under the name (job title / handle). */
  role: string
  image?: string
}

/** A single message in a conversation thread. */
export type ChatMessage = {
  id: string
  /** `CURRENT_USER_ID` for the signed-in user, otherwise the participant id. */
  senderId: string
  text: string
  /** ISO 8601 timestamp. */
  sentAt: string
}

/** A one-to-one conversation between the current user and a participant. */
export type ChatConversation = {
  id: string
  participant: ChatParticipant
  online: boolean
  unreadCount: number
  messages: ChatMessage[]
}
