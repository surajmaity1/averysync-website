/** Message author on the wire. */
export type AiMessageRole = 'user' | 'assistant'

/** One AI conversation as returned by `/v1/ai/conversations`. */
export type AiConversationDTO = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

/** A conversation read with its messages embedded (item GET). */
export type AiConversationDetailDTO = AiConversationDTO & {
  messages: AiMessageDTO[]
}

/** One message as returned by `/v1/ai/conversations/{id}/messages`. */
export type AiMessageDTO = {
  id: string
  conversationId: string
  role: AiMessageRole
  content: string
  createdAt: string
}

export type CreateAiConversationRequestDTO = {
  /** Optional explicit title; the server derives one from the first message otherwise. */
  title?: string
}

export type GetAiConversationByIdRequestDTO = {
  conversationId: string
}

export type UpdateAiConversationRequestDTO = {
  conversationId: string
  title: string
}

export type DeleteAiConversationRequestDTO = {
  conversationId: string
}

export type ListAiMessagesRequestDTO = {
  conversationId: string
}

export type CreateAiMessageRequestDTO = {
  conversationId: string
  content: string
}
