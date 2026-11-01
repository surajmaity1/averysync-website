import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import {
  AiConversationDetailDTO,
  AiConversationDTO,
  AiMessageDTO,
  CreateAiConversationRequestDTO,
  CreateAiMessageRequestDTO,
  DeleteAiConversationRequestDTO,
  GetAiConversationByIdRequestDTO,
  ListAiMessagesRequestDTO,
  UpdateAiConversationRequestDTO,
} from './ai.types'

/**
 * REST contract for the AI assistant, following the same `{ key, fn }`
 * convention as PostsApi. Resource model:
 *
 *   /v1/ai/conversations                   collection (GET list, POST create)
 *   /v1/ai/conversations/{id}              item (GET, PATCH rename, DELETE)
 *   /v1/ai/conversations/{id}/messages     sub-collection (GET list, POST send)
 *
 * ⚠️ The backend does not expose these endpoints yet — the `/ai/chat` page
 * currently runs on local state (see `modules/ai-chat/ai-chat.constants.ts`).
 * This module is the agreed contract to wire into `use-ai-chat-state` via
 * React Query once the endpoints ship. All calls carry the cookie JWT via
 * `withCredentials`.
 */
export const AiApi = {
  listConversations: {
    key: ['aiApi.listConversations'],
    fn: async (): Promise<TApiResponse<AiConversationDTO[]>> => {
      const { data } = await axiosAPIClient.get('/v1/ai/conversations')
      return data
    },
  },
  createConversation: {
    key: ['aiApi.createConversation'],
    fn: async (
      body: CreateAiConversationRequestDTO,
    ): Promise<TApiResponse<AiConversationDTO>> => {
      const { data } = await axiosAPIClient.post('/v1/ai/conversations', body)
      return data
    },
  },
  getConversationById: {
    key: ({ conversationId }: GetAiConversationByIdRequestDTO) => [
      'aiApi.getConversationById',
      conversationId,
    ],
    fn: async ({
      conversationId,
    }: GetAiConversationByIdRequestDTO): Promise<
      TApiResponse<AiConversationDetailDTO>
    > => {
      const { data } = await axiosAPIClient.get(
        `/v1/ai/conversations/${conversationId}`,
      )
      return data
    },
  },
  updateConversationById: {
    key: ['aiApi.updateConversationById'],
    fn: async ({
      conversationId,
      ...body
    }: UpdateAiConversationRequestDTO): Promise<
      TApiResponse<AiConversationDTO>
    > => {
      const { data } = await axiosAPIClient.patch(
        `/v1/ai/conversations/${conversationId}`,
        body,
      )
      return data
    },
  },
  deleteConversationById: {
    key: ['aiApi.deleteConversationById'],
    fn: async ({
      conversationId,
    }: DeleteAiConversationRequestDTO): Promise<void> => {
      await axiosAPIClient.delete(`/v1/ai/conversations/${conversationId}`)
    },
  },
  listMessages: {
    key: ({ conversationId }: ListAiMessagesRequestDTO) => [
      'aiApi.listMessages',
      conversationId,
    ],
    fn: async ({
      conversationId,
    }: ListAiMessagesRequestDTO): Promise<TApiResponse<AiMessageDTO[]>> => {
      const { data } = await axiosAPIClient.get(
        `/v1/ai/conversations/${conversationId}/messages`,
      )
      return data
    },
  },
  // POST returns both the stored user message and the assistant completion,
  // so a single round-trip renders the full turn.
  createMessage: {
    key: ['aiApi.createMessage'],
    fn: async ({
      conversationId,
      ...body
    }: CreateAiMessageRequestDTO): Promise<TApiResponse<AiMessageDTO[]>> => {
      const { data } = await axiosAPIClient.post(
        `/v1/ai/conversations/${conversationId}/messages`,
        body,
      )
      return data
    },
  },
}
