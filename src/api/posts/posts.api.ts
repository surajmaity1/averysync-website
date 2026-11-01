import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import {
  CreatePostRequestDTO,
  CreateUpdateSpaceReminderRequestDTO,
  DeletePostByIdRequestDTO,
  GetParticipantsResponse,
  GetPostByIdRequestDTO,
  GetPostsDTO,
  GetSpaceReminderByIdRequestDTO,
  JoinSpaceRequestDTO,
  JoinSpaceResponse,
  LeaveOrRemoveRequestDTO,
  ListParticipantsRequestDTO,
  MuteParticipantRequestDTO,
  ParticipantDTO,
  PostDTO,
  ReminderDTO,
  TPost,
  UpdatePostRequestDTO,
} from './posts.types'

export const PostsApi = {
  createPost: {
    key: ['postApi.createPost'],
    fn: async (postDTO: CreatePostRequestDTO): Promise<TApiResponse<TPost>> => {
      const { data } = await axiosAPIClient.post(`/v1/posts`, postDTO)
      return data
    },
  },
  getPosts: {
    key: ['postApi.getPosts'],
    fn: async (): Promise<GetPostsDTO> => {
      const { data } = await axiosAPIClient.get<GetPostsDTO>(`/v1/posts`)
      return data
    },
  },
  getPostById: {
    key: ({ postId }: GetPostByIdRequestDTO) => ['postApi.getPostById', postId],
    fn: async ({ postId }: GetPostByIdRequestDTO): Promise<PostDTO> => {
      const { data } = await axiosAPIClient.get<PostDTO>(`/v1/posts/${postId}`)
      return data
    },
  },
  createUpdateSpaceReminderById: {
    key: ['postApi.createUpdateSpaceReminderById'],
    fn: async ({
      postId,
      ...createUpdateSpaceReminderRequestDTO
    }: CreateUpdateSpaceReminderRequestDTO): Promise<ReminderDTO> => {
      const { data } = await axiosAPIClient.patch(
        `/v1/posts/${postId}/reminders`,
        createUpdateSpaceReminderRequestDTO,
      )
      return data
    },
  },
  getSpaceReminderById: {
    key: ({ postId }: GetSpaceReminderByIdRequestDTO) => [
      'postApi.getSpaceReminderById',
      postId,
    ],
    fn: async ({
      postId,
    }: GetSpaceReminderByIdRequestDTO): Promise<TApiResponse<ReminderDTO>> => {
      const { data } = await axiosAPIClient.get(`/v1/posts/${postId}/reminders`)
      return data
    },
  },
  updatePostById: {
    key: ({ postId }: UpdatePostRequestDTO) => [
      'postApi.updatePostById',
      postId,
    ],
    fn: async ({
      postId,
      ...updatePostRequestDTO
    }: UpdatePostRequestDTO): Promise<PostDTO> => {
      const { data } = await axiosAPIClient.patch<PostDTO>(
        `/v1/posts/${postId}`,
        updatePostRequestDTO,
      )
      return data
    },
  },
  deletePostById: {
    key: ({ postId }: DeletePostByIdRequestDTO) => [
      'postApi.deletePostById',
      postId,
    ],
    fn: async ({ postId }: DeletePostByIdRequestDTO): Promise<void> => {
      await axiosAPIClient.delete(`/v1/posts/${postId}`)
    },
  },
}

/**
 * Space participant + moderation endpoints. Follows the same `{ key, fn }`
 * convention as PostsApi. See docs/03-space-participants-integration-guide.md
 * §4 for the contract. All calls carry the cookie JWT via `withCredentials`.
 */
export const ParticipantsApi = {
  // Join / rejoin: creates or reactivates the caller's own row and returns the
  // WebRTC token (successor to the GET /posts/{id} token). Static mutation key.
  join: {
    key: ['participantsApi.join'],
    fn: async ({
      spaceId,
    }: JoinSpaceRequestDTO): Promise<JoinSpaceResponse> => {
      const { data } = await axiosAPIClient.post(
        `/v1/posts/${spaceId}/participants`,
        {},
      )
      return data
    },
  },
  // Roster read. Query key is scoped by spaceId for per-space caching.
  list: {
    key: ({ spaceId }: ListParticipantsRequestDTO) => [
      'participantsApi.list',
      spaceId,
    ],
    fn: async ({
      spaceId,
      includeLeft,
    }: ListParticipantsRequestDTO): Promise<GetParticipantsResponse> => {
      const { data } = await axiosAPIClient.get(
        `/v1/posts/${spaceId}/participants`,
        { params: includeLeft ? { includeLeft: 'true' } : undefined },
      )
      return data
    },
  },
  // Leave (self) or host-remove (other). 204, no body.
  leaveOrRemove: {
    key: ['participantsApi.leaveOrRemove'],
    fn: async ({ spaceId, userId }: LeaveOrRemoveRequestDTO): Promise<void> => {
      await axiosAPIClient.delete(`/v1/posts/${spaceId}/participants/${userId}`)
    },
  },
  // Host-only mute/unmute. spaceId + userId address the row (URL); only the
  // declarative mute state travels in the body.
  setMute: {
    key: ['participantsApi.setMute'],
    fn: async ({
      spaceId,
      userId,
      ...body
    }: MuteParticipantRequestDTO): Promise<{ data: ParticipantDTO }> => {
      const { data } = await axiosAPIClient.patch(
        `/v1/posts/${spaceId}/participants/${userId}/mute`,
        body,
      )
      return data
    },
  },
}
