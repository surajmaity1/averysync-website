import { ParticipantsApi } from '@/api/posts/posts.api'
import { mapParticipantError } from '@/utils/participant-errors'
import { spaceSession } from '@/utils/space-session-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Host mute/unmute for a live space.
 *
 * The bug this fixes: a host mute used to only fire the optimistic SFU relay
 * and never persist anything, so the mute was not enforced and no other
 * participant ever saw it — everyone kept hearing the "muted" user. Per
 * docs/03-space-participants-integration-guide.md §4.3(3) / §5.3, mute is
 * anchored on the AUTHORITATIVE backend `PATCH .../mute`: persisting it is what
 * makes the SFU enforce the mute and lets every other client reconcile it from
 * the roster. The optimistic SFU relay + local badge stay for instant host-side
 * feedback while the backend/SFU catch up.
 */
export const useSpaceModeration = (spaceId: string) => {
  const queryClient = useQueryClient()

  const setMute = useMutation({
    mutationKey: ParticipantsApi.setMute.key,
    mutationFn: (args: Parameters<typeof ParticipantsApi.setMute.fn>[0]) =>
      ParticipantsApi.setMute.fn(args),
    onSuccess: (_data, { userId, isMuted }) => {
      // Drop the loading skeleton and land the authoritative badge: a mute
      // shows muted; an unmute stays muted (the target opens their own mic).
      spaceSession.settlePeerMute(userId, isMuted)
      void queryClient.invalidateQueries({
        queryKey: ParticipantsApi.list.key({ spaceId }),
      })
    },
    onError: (error, { userId }) => {
      // The action didn't stick — clear the skeleton without flipping the badge.
      spaceSession.settlePeerMute(userId, false)
      toast.error(mapParticipantError(error).message)
    },
  })

  const mutePeer = (userId: string, name: string) => {
    // Instant SFU relay + a loading skeleton (no eager badge flip); the toast
    // and authoritative badge land once the backend confirms.
    spaceSession.mutePeer(userId)
    setMute.mutate(
      { spaceId, userId, isMuted: true },
      { onSuccess: () => toast.success(`Muted ${name}`) },
    )
  }

  const unmutePeer = (userId: string, name: string) => {
    spaceSession.unmutePeer(userId)
    setMute.mutate(
      { spaceId, userId, isMuted: false },
      { onSuccess: () => toast.success(`Unmuted ${name}`) },
    )
  }

  return { mutePeer, unmutePeer, isModerating: setMute.isPending }
}
