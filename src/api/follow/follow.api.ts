import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import {
  FollowerTargetDTO,
  FollowRequestActionDTO,
  FollowTargetDTO,
  ListFollowUsersDTO,
  TFollowEdge,
  TFollowList,
  TPaginationParams,
} from './follow.types'

const paginationParams = ({ limit, offset }: TPaginationParams) => ({
  ...(limit !== undefined && { limit }),
  ...(offset !== undefined && { offset }),
})

/**
 * Follow-graph endpoints (`docs/04-follow-and-profile-privacy.md`).
 * Follow / accept are idempotent on the backend (200 on repeats), so retries
 * of a settled mutation are safe.
 */
export const FollowApi = {
  follow: {
    key: ['followApi.follow'],
    fn: async ({ userId }: FollowTargetDTO): Promise<TFollowEdge> => {
      const { data } = await axiosAPIClient.post<TApiResponse<TFollowEdge>>(
        `/v1/users/${userId}/follow`,
        {},
      )

      return data.data
    },
  },
  /** Unfollows an accepted edge or cancels a pending request (backend decides). */
  unfollow: {
    key: ['followApi.unfollow'],
    fn: async ({ userId }: FollowTargetDTO): Promise<void> => {
      await axiosAPIClient.delete(`/v1/users/${userId}/follow`)
    },
  },
  listFollowers: {
    key: ({ userId }: FollowTargetDTO) => ['followApi.listFollowers', userId],
    fn: async ({
      userId,
      ...pagination
    }: ListFollowUsersDTO): Promise<TFollowList> => {
      const { data } = await axiosAPIClient.get<TFollowList>(
        `/v1/users/${userId}/followers`,
        { params: paginationParams(pagination) },
      )

      return data
    },
  },
  listFollowing: {
    key: ({ userId }: FollowTargetDTO) => ['followApi.listFollowing', userId],
    fn: async ({
      userId,
      ...pagination
    }: ListFollowUsersDTO): Promise<TFollowList> => {
      const { data } = await axiosAPIClient.get<TFollowList>(
        `/v1/users/${userId}/following`,
        { params: paginationParams(pagination) },
      )

      return data
    },
  },
  /** The caller's own pending inbox. */
  listRequests: {
    key: ['followApi.listRequests'],
    fn: async (pagination: TPaginationParams = {}): Promise<TFollowList> => {
      const { data } = await axiosAPIClient.get<TFollowList>(
        '/v1/requests/follow',
        { params: paginationParams(pagination) },
      )

      return data
    },
  },
  followRequestAction: {
    key: ['followApi.followRequestAction'],
    fn: async ({
      followerId,
      action,
    }: FollowRequestActionDTO): Promise<TFollowEdge | void> => {
      const { data } = await axiosAPIClient.patch<TApiResponse<TFollowEdge>>(
        `/v1/requests/follow/${followerId}`,
        { action },
      )

      return data?.data
    },
  },
  removeFollower: {
    key: ['followApi.removeFollower'],
    fn: async ({ followerId }: FollowerTargetDTO): Promise<void> => {
      await axiosAPIClient.delete(`/v1/followers/${followerId}`)
    },
  },
}
