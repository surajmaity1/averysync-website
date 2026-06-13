import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import {
  CreatePostRequestDTO,
  CreateUpdateSpaceReminderRequestDTO,
  DeletePostByIdRequestDTO,
  GetPostByIdRequestDTO,
  GetPostsDTO,
  GetSpaceReminderByIdRequestDTO,
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
