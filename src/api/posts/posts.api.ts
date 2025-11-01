import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import { CreatePostRequestDTO, GetPostsDTO, TPost } from './posts.types'

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
}
