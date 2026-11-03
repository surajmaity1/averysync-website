import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import { LikeTargetDTO, TLikeState } from './likes.types'

/**
 * Post-like endpoints. A "post" and a "space" are the same entity server-side
 * (distinguished by `type`), so one like sub-resource covers both. Like /
 * unlike are idempotent on the backend and always return the authoritative
 * `{ liked, likeCount }`, so retries of a settled mutation are safe.
 */
export const LikesApi = {
  like: {
    key: ['likesApi.like'],
    fn: async ({ postId }: LikeTargetDTO): Promise<TLikeState> => {
      const { data } = await axiosAPIClient.post<TApiResponse<TLikeState>>(
        `/v1/posts/${postId}/like`,
        {},
      )

      return data.data
    },
  },
  unlike: {
    key: ['likesApi.unlike'],
    fn: async ({ postId }: LikeTargetDTO): Promise<TLikeState> => {
      const { data } = await axiosAPIClient.delete<TApiResponse<TLikeState>>(
        `/v1/posts/${postId}/like`,
      )

      return data.data
    },
  },
}
