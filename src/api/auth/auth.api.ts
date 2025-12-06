import { axiosAPIClient } from '@/libs/axios-api-client'

export const AuthApi = {
  logout: {
    key: ['AuthApi.logout'],
    fn: async (): Promise<void> => {
      await axiosAPIClient.post('/v1/auth/logout')
    },
  },
}
