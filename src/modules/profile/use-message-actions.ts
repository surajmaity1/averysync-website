import { ChatApi } from '@/api/chat/chat.api'
import { messageOf } from '@/libs/api-error'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

/**
 * Starts (or reopens) a direct-message thread with a user and hands off to the
 * chat page. The DM is created idempotently on the backend; a public follow is
 * ACCEPTED immediately, a not-followed-back peer lands in their Requests inbox.
 */
export const useMessageActions = () => {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (userId: string) =>
      ChatApi.createOrGetDirect.fn({ participantId: userId }),
    onSuccess: (conversation) => {
      void navigate({ to: '/chat', search: { c: conversation.id } })
    },
    onError: (error) => toast.error(messageOf(error)),
  })

  return {
    message: (userId: string) => mutation.mutate(userId),
    isStarting: mutation.isPending,
  }
}
