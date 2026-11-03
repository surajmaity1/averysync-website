import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import {
  CreateConversationDTO,
  ListConversationsDTO,
  ListMessagesDTO,
  SendMessageDTO,
  TConversationDetail,
  TConversationSummary,
  TCursorPage,
  TMessage,
} from './chat.types'

const cursorParams = (limit?: number, cursor?: string | null) => ({
  ...(limit !== undefined && { limit }),
  ...(cursor ? { cursor } : {}),
})

/**
 * Direct-messaging endpoints (`docs/05-chat-messaging.md`). A DM is created
 * (or fetched) idempotently; sending / accepting are idempotent on the backend,
 * so retries of a settled mutation are safe.
 */
export const ChatApi = {
  createOrGetDirect: {
    key: ['chatApi.createOrGetDirect'],
    fn: async ({
      participantId,
    }: CreateConversationDTO): Promise<TConversationDetail> => {
      const { data } = await axiosAPIClient.post<
        TApiResponse<TConversationDetail>
      >('/v1/conversations', { type: 'DIRECT', participantId })

      return data.data
    },
  },
  listConversations: {
    key: (section: string) => ['chatApi.listConversations', section],
    fn: async ({
      section,
      limit,
      cursor,
    }: ListConversationsDTO): Promise<TCursorPage<TConversationSummary>> => {
      const { data } = await axiosAPIClient.get<
        TCursorPage<TConversationSummary>
      >('/v1/conversations', {
        params: { section, ...cursorParams(limit, cursor) },
      })

      return data
    },
  },
  getConversation: {
    key: (conversationId: string) => [
      'chatApi.getConversation',
      conversationId,
    ],
    fn: async (conversationId: string): Promise<TConversationDetail> => {
      const { data } = await axiosAPIClient.get<
        TApiResponse<TConversationDetail>
      >(`/v1/conversations/${conversationId}`)

      return data.data
    },
  },
  listMessages: {
    key: (conversationId: string) => ['chatApi.listMessages', conversationId],
    fn: async ({
      conversationId,
      limit,
      cursor,
    }: ListMessagesDTO): Promise<TCursorPage<TMessage>> => {
      const { data } = await axiosAPIClient.get<TCursorPage<TMessage>>(
        `/v1/conversations/${conversationId}/messages`,
        { params: cursorParams(limit, cursor) },
      )

      return data
    },
  },
  sendMessage: {
    key: ['chatApi.sendMessage'],
    fn: async ({
      conversationId,
      body,
      clientMessageId,
    }: SendMessageDTO): Promise<TMessage> => {
      const { data } = await axiosAPIClient.post<TApiResponse<TMessage>>(
        `/v1/conversations/${conversationId}/messages`,
        { body, ...(clientMessageId ? { clientMessageId } : {}) },
      )

      return data.data
    },
  },
  /** Number of conversations with unread messages — the message-icon badge. */
  unreadCount: {
    key: ['chatApi.unreadCount'],
    fn: async (): Promise<number> => {
      const { data } = await axiosAPIClient.get<
        TApiResponse<{ count: number }>
      >('/v1/conversations/unread-count')

      return data.data.count
    },
  },
  markRead: {
    key: ['chatApi.markRead'],
    fn: async (conversationId: string): Promise<void> => {
      await axiosAPIClient.post(`/v1/conversations/${conversationId}/read`, {})
    },
  },
  acceptRequest: {
    key: ['chatApi.acceptRequest'],
    fn: async (conversationId: string): Promise<TConversationDetail> => {
      const { data } = await axiosAPIClient.post<
        TApiResponse<TConversationDetail>
      >(`/v1/conversations/${conversationId}/accept`, {})

      return data.data
    },
  },
  declineRequest: {
    key: ['chatApi.declineRequest'],
    fn: async (conversationId: string): Promise<void> => {
      await axiosAPIClient.post(
        `/v1/conversations/${conversationId}/decline`,
        {},
      )
    },
  },
}
