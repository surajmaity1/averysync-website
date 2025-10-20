import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import { TUser, TUserSearchParams, TUsersSearchResponse } from './users.type'

export const UsersAPI = {
  getUserInfo: {
    key: ['usersApi.getUserInfo'],
    fn: async (): Promise<TUser> => {
      const { data } = await axiosAPIClient.get<TApiResponse<TUser>>(
        '/v1/users',
        {
          params: {
            profile: true,
          },
        },
      )

      return data.data
    },
    users: {
      key: (params?: TUserSearchParams) => [
        'usersApi.users',
        ...Object.values(params || {}),
      ],
      fn: async (
        params?: TUserSearchParams,
      ): Promise<TApiResponse<TUsersSearchResponse>> => {
        const { data } = await axiosAPIClient.get(`/v1/users`, { params })
        return data
      },
    },
  },
}
