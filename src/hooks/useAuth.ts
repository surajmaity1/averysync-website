import { AuthApi } from '@/api/auth/auth.api'
import { UsersAPI } from '@/api/users/users.api'
import { TUser } from '@/api/users/users.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const DEFAULT_USER: TUser = {
  id: '',
  name: '',
  email: '',
  image: '',
}

export const useAuth = () => {
  const queryClient = useQueryClient()
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    retry: false,
    staleTime: 15 * 60 * 1000,
    queryKey: UsersAPI.getUserInfo.key,
    queryFn: UsersAPI.getUserInfo.fn,
  })
  const logoutMutation = useMutation({
    mutationFn: AuthApi.logout.fn,
    onSuccess: () => {
      queryClient.clear()
      window.location.href = '/'
    },
  })

  return {
    user: user || DEFAULT_USER,
    isLoading,
    isError,
    isLoggedIn: !!user,
    logoutMutation,
  }
}
