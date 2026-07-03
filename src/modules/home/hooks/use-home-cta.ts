import { applicationConfig } from '@/config/app-config'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'

/**
 * Shared behavior for every marketing CTA: authenticated users go straight
 * to the feed, everyone else is sent through Google sign-in.
 */
export const useHomeCta = () => {
  const navigate = useNavigate()
  const { isLoggedIn, isLoading } = useAuth()

  const startSpace = () => {
    if (isLoggedIn) {
      navigate({ to: '/feed' })
      return
    }
    window.location.href = `${applicationConfig.backendApplicationURL}/v1/auth/google/login`
  }

  return { isLoggedIn, isLoading, startSpace }
}
