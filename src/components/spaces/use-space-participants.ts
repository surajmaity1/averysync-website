import { ParticipantsApi } from '@/api/posts/posts.api'
import type {
  JoinSpaceResponse,
  LeaveOrRemoveRequestDTO,
  MuteParticipantRequestDTO,
  ParticipantDTO,
} from '@/api/posts/posts.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/**
 * TanStack Query hooks for the space participants + moderation endpoints
 * (docs/03-space-participants-integration-guide.md §4). Thin wrappers over
 * ParticipantsApi that centralise cache-key wiring and roster invalidation.
 */

type RosterOptions = {
  /** Include departed rows (attendance history). Default: active only. */
  includeLeft?: boolean
  /** Poll interval in ms. Omit/0 to disable — roster is otherwise reconciled
   *  after mutations. Used for the live-space reconcile loop (docs/03 §5.3). */
  refetchIntervalMs?: number
  enabled?: boolean
}

/**
 * Query the roster for a space. Only runs when `spaceId` is set (and `enabled`
 * is not false). `isMuted` in each row is display-ready (already effective).
 */
export const useSpaceRoster = (
  spaceId: string | undefined,
  { includeLeft, refetchIntervalMs, enabled = true }: RosterOptions = {},
) =>
  useQuery({
    queryKey: [
      ...ParticipantsApi.list.key({ spaceId: spaceId ?? '' }),
      { includeLeft: includeLeft ?? false },
    ],
    queryFn: () =>
      ParticipantsApi.list.fn({ spaceId: spaceId as string, includeLeft }),
    enabled: enabled && !!spaceId,
    refetchInterval: refetchIntervalMs || false,
  })

/**
 * Join / rejoin mutation. On success the roster is invalidated so every open
 * surface refetches the fresh set. Callers pass `response.token` to the SFU.
 */
export const useJoinSpace = () => {
  const queryClient = useQueryClient()
  return useMutation<JoinSpaceResponse, unknown, { spaceId: string }>({
    mutationKey: ParticipantsApi.join.key,
    mutationFn: ({ spaceId }) => ParticipantsApi.join.fn({ spaceId }),
    onSuccess: (_data, { spaceId }) => {
      void queryClient.invalidateQueries({
        queryKey: ParticipantsApi.list.key({ spaceId }),
      })
    },
  })
}

/**
 * Leave (self) or host-remove (other). Invalidates the roster on success.
 */
export const useLeaveOrRemoveParticipant = () => {
  const queryClient = useQueryClient()
  return useMutation<void, unknown, LeaveOrRemoveRequestDTO>({
    mutationKey: ParticipantsApi.leaveOrRemove.key,
    mutationFn: (args) => ParticipantsApi.leaveOrRemove.fn(args),
    onSuccess: (_data, { spaceId }) => {
      void queryClient.invalidateQueries({
        queryKey: ParticipantsApi.list.key({ spaceId }),
      })
    },
  })
}

/**
 * Host mute/unmute. Returns the updated DTO; also invalidates the roster so
 * other viewers reconcile (docs/03 §4.3 point 3).
 */
export const useSetParticipantMute = () => {
  const queryClient = useQueryClient()
  return useMutation<
    { data: ParticipantDTO },
    unknown,
    MuteParticipantRequestDTO
  >({
    mutationKey: ParticipantsApi.setMute.key,
    mutationFn: (args) => ParticipantsApi.setMute.fn(args),
    onSuccess: (_data, { spaceId }) => {
      void queryClient.invalidateQueries({
        queryKey: ParticipantsApi.list.key({ spaceId }),
      })
    },
  })
}
