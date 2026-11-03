import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import {
  GetUserByIdRequestDTO,
  TUser,
  TUserProfile,
  UpdateProfileRequestDTO,
} from './users.type'

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
    fn: async ({ userId }: GetUserByIdRequestDTO): Promise<TUserProfile> => {
      const { data } = await axiosAPIClient.get<TApiResponse<TUserProfile>>(
        `/v1/users/${userId}`,
      )

      return data.data
    },
  },
  /** Toggles the caller's profile privacy — `PATCH /v1/users?profile=true`. */
  updateProfile: {
    key: ['usersApi.updateProfile'],
    fn: async (body: UpdateProfileRequestDTO): Promise<TUserProfile> => {
      const { data } = await axiosAPIClient.patch<TApiResponse<TUserProfile>>(
        '/v1/users',
        body,
        { params: { profile: true } },
      )

      return data.data
    },
  },
}
