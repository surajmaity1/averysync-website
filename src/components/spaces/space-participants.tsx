import { UsersAPI } from '@/api/users/users.api'
import { TUser } from '@/api/users/users.type'
import {
  buildParticipantList,
  SpaceParticipant,
} from '@/utils/space-participants'
import { useQuery } from '@tanstack/react-query'
import {
  Ban,
  Hand,
  Loader2,
  Mic,
  MicOff,
  UserRound,
  UserX,
  Users,
} from 'lucide-react'
import { AvatarUser } from '../ui/avatar'
import { AudioLevelMeter } from './audio-level-meter'
import {
  DropDownMenu,
  DropDownMenuContent,
  DropDownMenuItem,
  DropDownMenuSeparator,
  DropDownMenuTrigger,
} from '../ui/dropdown-menu'

type ModerationHandlers = {
  onMutePeer: (userId: string, name: string) => void
  onUnmutePeer: (userId: string, name: string) => void
  onRemovePeer: (userId: string, name: string) => void
  onBlockPeer: (userId: string, name: string) => void
}

type SpaceParticipantsProps = ModerationHandlers & {
  /** Opens the clicked participant's profile page. */
  onViewProfile: (userId: string) => void
  hostId: string
  /**
   * Whether the host is currently connected (from the session store's live
   * presence tracking). When false the host avatar is dropped and a notice
   * shown — a disconnected host must not linger in anyone's list.
   */
  hostPresent: boolean
  currentUser?: TUser
  peerIds: string[]
  /**
   * Whether the viewer is a host/cohost. Gates the mic-request badge — only
   * moderators may see who is asking to speak.
   */
  viewerCanModerate: boolean
  /** Pending "request to speak" peer ids (only moderators receive them). */
  micRequests: string[]
  /** Local mute state — the source of truth for the self avatar's mic badge. */
  isSelfMuted: boolean
  /** peerId → muted, from mic_state broadcasts. Absent peers show as muted. */
  peerMicStates: Record<string, boolean>
  /**
   * Peers whose host mute/unmute is still persisting. Their mic badge shows a
   * loading skeleton instead of a mic state until the backend confirms.
   */
  moderationPendingPeerIds: string[]
  /** peerId → emoji currently popping on that peer's avatar. */
  reactions: Record<string, string>
  /** Own mic stream — drives the self avatar's voice-activity meter. */
  localStream: MediaStream | null
  /** Remote streams; the SFU sets stream.id to the owning peer's id. */
  remoteStreams: MediaStream[]
}

/**
 * Live participant list for a space. The current user is always shown; the
 * host is shown while present (their peer_left / peer_joined broadcasts drive
 * `hostPresent` in real time); everyone else comes from the server's
 * peer_joined / peer_left broadcasts, so the list stays in sync across all
 * connected users.
 */
export const SpaceParticipants = ({
  hostId,
  hostPresent,
  currentUser,
  peerIds,
  viewerCanModerate,
  micRequests,
  isSelfMuted,
  peerMicStates,
  moderationPendingPeerIds,
  reactions,
  localStream,
  remoteStreams,
  onViewProfile,
  onMutePeer,
  onUnmutePeer,
  onRemovePeer,
  onBlockPeer,
}: SpaceParticipantsProps) => {
  const viewerIsHost = currentUser?.id === hostId

  const participants = buildParticipantList({
    hostId,
    hostPresent,
    currentUserId: currentUser?.id,
    peerIds,
  })

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <Users className="h-3.5 w-3.5" />
        <span>
          In this space · {participants.length} participant
          {participants.length === 1 ? '' : 's'}
        </span>
      </div>
      {!hostPresent && (
        <div className="mb-3 flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          The host lost connection — they may rejoin shortly.
        </div>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-4">
        {participants.map((participant) => (
          <ParticipantAvatar
            key={participant.userId}
            participant={participant}
            currentUser={currentUser}
            muted={
              participant.isSelf
                ? isSelfMuted
                : // Everyone joins muted, so an unknown mic state means muted;
                  // each client re-announces on (re)connect to close the gap.
                  (peerMicStates[participant.userId] ?? true)
            }
            stream={
              participant.isSelf
                ? localStream
                : (remoteStreams.find((s) => s.id === participant.userId) ??
                  null)
            }
            // A host mute/unmute is persisting — show a loading skeleton in
            // place of this peer's mic badge until the backend confirms.
            moderationPending={
              !participant.isSelf &&
              moderationPendingPeerIds.includes(participant.userId)
            }
            reaction={reactions[participant.userId]}
            // The raised hand is moderator-only knowledge: others must not
            // learn who is asking for the mic.
            requestedMic={
              viewerCanModerate && micRequests.includes(participant.userId)
            }
            // Hosts moderate everyone but themselves.
            canModerate={viewerIsHost && !participant.isSelf}
            onViewProfile={onViewProfile}
            onMutePeer={onMutePeer}
            onUnmutePeer={onUnmutePeer}
            onRemovePeer={onRemovePeer}
            onBlockPeer={onBlockPeer}
          />
        ))}
      </div>
    </div>
  )
}

type ParticipantAvatarProps = ModerationHandlers & {
  onViewProfile: (userId: string) => void
  participant: SpaceParticipant
  currentUser?: TUser
  muted: boolean
  /** A host mute/unmute for this peer is still persisting (loading skeleton). */
  moderationPending: boolean
  /** This participant's audio stream, for the voice-activity meter. */
  stream: MediaStream | null
  reaction?: string
  /** Pending mic request — already gated to moderator viewers by the parent. */
  requestedMic: boolean
  canModerate: boolean
}

const ParticipantAvatar = ({
  participant,
  currentUser,
  muted,
  moderationPending,
  stream,
  reaction,
  requestedMic,
  canModerate,
  onViewProfile,
  onMutePeer,
  onUnmutePeer,
  onRemovePeer,
  onBlockPeer,
}: ParticipantAvatarProps) => {
  const { userId, isHost, isSelf } = participant

  const { data: fetchedUser } = useQuery({
    queryKey: UsersAPI.getUserById.key({ userId }),
    queryFn: () => UsersAPI.getUserById.fn({ userId }),
    enabled: !isSelf,
    staleTime: 5 * 60 * 1000,
  })

  const user = isSelf ? currentUser : fetchedUser
  const displayName = user?.name ?? 'Listener'

  const avatar = (
    <div className="relative">
      <AvatarUser src={user?.image} name={user?.name} size={44} />

      {isHost && (
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-1.5 py-px text-[9px] font-semibold text-white">
          Host
        </span>
      )}

      {/* Pending mic request — top-right, moderator-only (gated upstream) */}
      {requestedMic && (
        <span
          className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-amber-500"
          title="Requested to speak"
          aria-label="Requested to speak"
        >
          <Hand className="h-2.5 w-2.5 text-white" />
        </span>
      )}

      {/* Mic state — bottom-left. A pending host mute/unmute shows a loading
          skeleton here instead of a mic state until the backend confirms. */}
      <span
        className={`absolute -bottom-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white ${
          moderationPending
            ? 'animate-pulse bg-gray-300'
            : muted
              ? 'bg-gray-400'
              : 'bg-green-500'
        }`}
        title={moderationPending ? 'Updating…' : muted ? 'Muted' : 'Mic on'}
      >
        {moderationPending ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin text-white" />
        ) : muted ? (
          <MicOff className="h-2.5 w-2.5 text-white" />
        ) : (
          <Mic className="h-2.5 w-2.5 text-white" />
        )}
      </span>

      {/* Reaction — bottom-right */}
      {reaction && (
        <span
          key={reaction}
          className="reaction-pop absolute -right-1.5 -bottom-1 text-base"
          role="img"
          aria-label="reaction"
        >
          {reaction}
        </span>
      )}
    </div>
  )

  return (
    <div className="flex w-16 flex-col items-center gap-1">
      {/* modal={false}: a modal menu sets body pointer-events:none on top of
          the modal space dialog doing the same. Selecting "View profile"
          closes both and navigates in one tick, and the two layers restored
          the body style out of order — leaving the whole app unclickable.
          The dialog already provides modality; the menu must not. */}
      <DropDownMenu modal={false}>
        <DropDownMenuTrigger
          className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label={`Options for ${isSelf ? 'you' : displayName}`}
        >
          {avatar}
        </DropDownMenuTrigger>
        {/* Deliberately NOT portaled. Portaled to <body> the content sits
            outside the modal dialog's focus trap: on open the menu focuses
            itself, the dialog's FocusScope yanks focus straight back, and the
            menu dismisses on that focus-outside — it opened and closed within
            a millisecond (hosts hit this reliably). Inline, the menu lives
            inside the trap (no steal-back) and inherits the dialog content's
            pointer-events:auto. */}
        <DropDownMenuContent
          sideOffset={6}
          className="z-50 min-w-40 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-md"
        >
          <DropDownMenuItem
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 outline-none hover:bg-gray-100"
            onSelect={() => onViewProfile(userId)}
          >
            <UserRound className="h-3.5 w-3.5" />
            View profile
          </DropDownMenuItem>
          {canModerate && (
            <>
              <DropDownMenuSeparator />
              {muted ? (
                <DropDownMenuItem
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 outline-none hover:bg-gray-100 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                  disabled={moderationPending}
                  onSelect={() => onUnmutePeer(userId, displayName)}
                >
                  {moderationPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                  Unmute
                </DropDownMenuItem>
              ) : (
                <DropDownMenuItem
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 outline-none hover:bg-gray-100 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                  disabled={moderationPending}
                  onSelect={() => onMutePeer(userId, displayName)}
                >
                  {moderationPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <MicOff className="h-3.5 w-3.5" />
                  )}
                  Mute
                </DropDownMenuItem>
              )}
              <DropDownMenuItem
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 outline-none hover:bg-gray-100"
                onSelect={() => onRemovePeer(userId, displayName)}
              >
                <UserX className="h-3.5 w-3.5" />
                Remove from space
              </DropDownMenuItem>
              <DropDownMenuItem
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-red-600 outline-none hover:bg-red-50"
                onSelect={() => onBlockPeer(userId, displayName)}
              >
                <Ban className="h-3.5 w-3.5" />
                Block from space
              </DropDownMenuItem>
            </>
          )}
        </DropDownMenuContent>
      </DropDownMenu>
      {/* Fixed-height slot so meters appearing/vanishing don't shift the row. */}
      <span className="flex h-3 items-end">
        <AudioLevelMeter stream={stream} muted={muted} />
      </span>
      <span className="max-w-full truncate text-[11px] text-gray-600">
        {isSelf ? 'You' : displayName}
      </span>
    </div>
  )
}
