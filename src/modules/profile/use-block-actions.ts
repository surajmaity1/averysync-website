import { BlockApi } from '@/api/block/block.api'
import { UsersAPI } from '@/api/users/users.api'
import { messageOf } from '@/libs/api-error'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type UseBlockActionsOptions = {
  /**
   * Fired after a successful block. Because a blocked profile becomes a 404
   * for both parties (backend §7.7), the caller uses this to leave the page.
   */
  onBlocked?: () => void
}

/**
 * Block-graph mutations. Blocking invalidates the target profile (its next
 * fetch 404s) and the blocks list; unblocking invalidates the blocks list and
 * the target profile so it becomes viewable again. Backend messages surface as
 * toasts — mirrors `useFollowActions`.
 */
export const useBlockActions = ({ onBlocked }: UseBlockActionsOptions = {}) => {
  const queryClient = useQueryClient()

  const invalidateProfile = (userId: string) =>
    queryClient.invalidateQueries({
      queryKey: UsersAPI.getUserById.key({ userId }),
    })

  const invalidateBlocks = () =>
    queryClient.invalidateQueries({ queryKey: BlockApi.listBlocks.key })

  const onError = (error: unknown) => toast.error(messageOf(error))

  const blockMutation = useMutation({
    mutationFn: ({ userId }: { userId: string; name: string }) =>
      BlockApi.block.fn({ userId }),
    onSuccess: (_edge, { userId, name }) => {
      void invalidateProfile(userId)
      void invalidateBlocks()
      toast.success(`Blocked ${name}`)
      onBlocked?.()
    },
    onError,
  })

  const unblockMutation = useMutation({
    mutationFn: ({ userId }: { userId: string; name: string }) =>
      BlockApi.unblock.fn({ userId }),
    onSuccess: (_void, { userId, name }) => {
      void invalidateBlocks()
      void invalidateProfile(userId)
      toast.success(`Unblocked ${name}`)
    },
    onError,
  })

  return {
    block: (userId: string, name: string) =>
      blockMutation.mutate({ userId, name }),
    unblock: (userId: string, name: string) =>
      unblockMutation.mutate({ userId, name }),
    isBlocking: blockMutation.isPending,
  }
}
