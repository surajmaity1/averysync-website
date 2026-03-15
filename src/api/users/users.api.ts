import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import { GetUserByIdRequestDTO, TUser } from './users.type'

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
  },
  getUserById: {
    key: ({ userId }: GetUserByIdRequestDTO) => [
      'usersApi.getUserById',
      userId,
    ],
    fn: async ({ userId }: GetUserByIdRequestDTO): Promise<TUser> => {
      const { data } = await axiosAPIClient.get<TApiResponse<TUser>>(
        `/v1/users/${userId}`,
      )

      return data.data
    },
  },
}
