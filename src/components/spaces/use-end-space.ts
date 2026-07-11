import { PostsApi } from '@/api/posts/posts.api'
import { SpaceStatus } from '@/types/post'
import { spaceSession } from '@/utils/space-session-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Ends a space the host owns. Shared by the space dialog and the persistent
 * floating bar so a host can end from either surface — the bar exists precisely
 * because the session now outlives the dialog.
 *
 * Order matters: broadcast end_space (so listeners are told) while the socket
 * is still open, then tear the local session down.
 */
export function useEndSpace(postId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      if (!postId) throw new Error('No active space to end')
      return PostsApi.updatePostById.fn({
        postId,
        status: SpaceStatus.ended,
      })
    },
    onMutate: () => {
      toast.loading('Ending the space...', { id: 'end-space' })
    },
    onSuccess: async () => {
      toast.success('Space ended', { id: 'end-space' })

      spaceSession.sendEndSpace()
      spaceSession.leave()

      if (postId) {
        void queryClient.invalidateQueries({
          queryKey: PostsApi.getPostById.key({ postId }),
        })
      }
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPosts.key,
      })
    },
    onError: (error) => {
      console.error('Failed to end space:', error)
      toast.error('Unable to end the space', { id: 'end-space' })
    },
  })
}
