import { FollowApi } from '@/api/follow/follow.api'
import { UsersAPI } from '@/api/users/users.api'
import { messageOf } from '@/libs/api-error'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Follow-graph mutations for the profile page of `profileUserId`. Every
 * success invalidates the profile plus all follow lists so counts, button
 * state, and open dialogs re-sync from the backend (the single source of
 * truth for the edge state — mirrors the moderation hook's approach).
 */
export const useFollowActions = (profileUserId: string) => {
  const queryClient = useQueryClient()

  const refreshFollowGraph = () => {
    void queryClient.invalidateQueries({
      queryKey: UsersAPI.getUserById.key({ userId: profileUserId }),
    })
    void queryClient.invalidateQueries({
      queryKey: FollowApi.listFollowers.key({ userId: profileUserId }),
    })
    void queryClient.invalidateQueries({
      queryKey: FollowApi.listFollowing.key({ userId: profileUserId }),
    })
    void queryClient.invalidateQueries({
      queryKey: FollowApi.listRequests.key,
    })
  }

  const onError = (error: unknown) => toast.error(messageOf(error))

  const followMutation = useMutation({
    mutationFn: () => FollowApi.follow.fn({ userId: profileUserId }),
    onSuccess: (edge) => {
      refreshFollowGraph()
      if (edge.status === 'PENDING') toast.success('Follow request sent')
    },
    onError,
  })

  const unfollowMutation = useMutation({
    mutationFn: () => FollowApi.unfollow.fn({ userId: profileUserId }),
    onSuccess: refreshFollowGraph,
    onError,
  })

  const acceptMutation = useMutation({
    mutationFn: ({ followerId }: { followerId: string; name: string }) =>
      FollowApi.followRequestAction.fn({ followerId, action: 'accept' }),
    onSuccess: (_edge, { name }) => {
      refreshFollowGraph()
    },
    onError,
  })

  const rejectMutation = useMutation({
    mutationFn: ({ followerId }: { followerId: string }) =>
      FollowApi.followRequestAction.fn({ followerId, action: 'reject' }),
    onSuccess: refreshFollowGraph,
    onError,
  })

  const removeFollowerMutation = useMutation({
    mutationFn: ({ followerId }: { followerId: string; name: string }) =>
      FollowApi.removeFollower.fn({ followerId }),
    onSuccess: (_void, { name }) => {
      refreshFollowGraph()
      toast.success(`Removed ${name}`)
    },
    onError,
  })

  return {
    follow: () => followMutation.mutate(),
    /** Unfollow an accepted edge, or cancel a pending request. */
    unfollow: () => unfollowMutation.mutate(),
    acceptRequest: (followerId: string, name: string) =>
      acceptMutation.mutate({ followerId, name }),
    rejectRequest: (followerId: string) =>
      rejectMutation.mutate({ followerId }),
    removeFollower: (followerId: string, name: string) =>
      removeFollowerMutation.mutate({ followerId, name }),
    isMutatingEdge: followMutation.isPending || unfollowMutation.isPending,
  }
}
