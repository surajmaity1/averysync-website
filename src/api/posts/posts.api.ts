import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import { CreatePostRequestDTO, TPost } from './posts.types'

export const PostsApi = {
  createPost: {
    key: ['postApi.createPost'],
    fn: async (postDTO: CreatePostRequestDTO): Promise<TApiResponse<TPost>> => {
      const { data } = await axiosAPIClient.post(`/v1/posts`, postDTO)
      return data
    },
  },
}
