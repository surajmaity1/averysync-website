import { isAxiosError } from 'axios'

const fallbackMessage = 'Something went wrong. Please try again.'

/**
 * The user-facing message for a failed request: the backend's `message` field
 * when present, otherwise a generic fallback. Used to drive error toasts.
 */
export const messageOf = (error: unknown): string => {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message
    if (message) return message
  }
  return fallbackMessage
}
