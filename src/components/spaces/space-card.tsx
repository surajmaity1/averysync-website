import { PostsApi } from '@/api/posts/posts.api'
import { Post } from '@/api/posts/posts.types'
import { UsersAPI } from '@/api/users/users.api'
import { applicationConfig } from '@/config/app-config'
import { cn } from '@/libs/utils'
import { PostStatus, SpaceStatus } from '@/types/post'
import { shouldAutoJoinSpace } from '@/utils/space-auto-join'
import { shouldOfferManualJoin } from '@/utils/space-manual-join'
import {
  roleCanModerate,
  spaceSession,
  useSpaceSession,
} from '@/utils/space-session-store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleX, Hand, Mic, MicOff, Play, Users, XIcon } from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Button } from '../ui/button'
import { MicRequestPanel } from './mic-request-panel'
import { ReactionPicker } from './reaction-picker'
import { SpaceParticipants } from './space-participants'
import { useEndSpace } from './use-end-space'

type SpaceAlertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: Post
  children: ReactNode
}

const draftWebsocketURL = `${applicationConfig.streamURL}/ws`

export const SpaceAlertDialog = ({
  open,
  onOpenChange,
  post,
  children,
}: SpaceAlertDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger className="flex space-x-2">
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md bg-gray-50">
        <AlertDialogTitle className="font-semibold">
          {post.title}
        </AlertDialogTitle>
        <AlertDialogDescription className="font-light">
          {post.description}
        </AlertDialogDescription>
        <SpaceDetailView post={post} onClose={() => onOpenChange(false)} />
        <Button
          className="absolute top-4 right-4 bg-rose-500 text-white hover:bg-rose-600"
          onClick={() => {
            onOpenChange(false)
          }}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  )
}

type SpaceDetailViewProps = {
  post: Post
  onClose: () => void
}

const SpaceDetailView = ({ post, onClose }: SpaceDetailViewProps) => {
  const queryClient = useQueryClient()
  const [connectionToken, setConnectionToken] = useState<string | null>(null)
  const [websocketUrl, setWebsocketUrl] = useState<string | null>(null)
  const joinAttemptedRef = useRef(false)

  // The session lives in an app-level singleton, not in this component — so
  // closing the dialog (which unmounts this view) no longer stops the space.
  const session = useSpaceSession()

  const spaceStatus = post.status === 1
  const isLiveStatus = post.status === 2

  // The store is global; a status only concerns THIS card when its post is the
  // active one. Otherwise treat this card as idle.
  const isThisSpace = session.activePostId === post.id
  const status = isThisSpace ? session.status : 'idle'
  const isConnected = isThisSpace && session.isConnected
  const isReconnecting = isThisSpace && session.isReconnecting
  const isMuted = session.isMuted
  const canSpeak = session.canSpeak
  // Moderation surfaces (approve/deny, request badges) are for hosts/cohosts
  // only. Deliberately role-based, NOT canSpeak — a mic-approved listener can
  // speak but must never see or answer other people's requests.
  const isModerator = isThisSpace && roleCanModerate(session.role)
  const { hasRequestedMic, micRequests } = session
  const { peerIds, peerMicStates, reactions, remoteStreams } = session

  const { data: userData } = useQuery({
    queryKey: UsersAPI.getUserInfo.key,
    queryFn: UsersAPI.getUserInfo.fn,
  })
  const isHost = userData?.id === post.createdBy

  // Host + self are rendered separately, so exclude them from the peer list
  // to avoid duplicate avatars when their peer_joined events arrive.
  const activePeerIds = peerIds.filter(
    (id) => id !== post.createdBy && id !== userData?.id,
  )
  // Live host presence — the store flips this on the host's own
  // peer_left/peer_joined, so a dropped host leaves every listener's list
  // (and count) in real time instead of lingering as a ghost participant.
  const hostPresent = isThisSpace ? session.isHostPresent : true
  const participantCount =
    (hostPresent ? 1 : 0) + (isHost ? 0 : 1) + activePeerIds.length

  const endSpace = useEndSpace(post.id)

  const startSpace = (token: string) =>
    spaceSession.start({
      postId: post.id,
      postTitle: post.title,
      role: isHost ? 'host' : 'listener',
      hostId: post.createdBy,
      tokenProvider: token,
      wsUrl: draftWebsocketURL,
    })

  // Fetch the post (and its connection token) for anyone who may need to
  // (re)join a live space — listeners always, and the HOST when their own
  // session dropped: the start-space token lives in component state and dies
  // with the dialog, so a returning host needs a fresh one from here.
  const { data } = useQuery({
    queryKey: PostsApi.getPostById.key({ postId: post.id }),
    queryFn: () => PostsApi.getPostById.fn({ postId: post.id }),
    enabled: isLiveStatus,
  })

  // The space is over if the session learned it (space_ended broadcast, the
  // host's own end) or any server data says so. The feed cache can keep
  // claiming "live" for a while after the host closes — none of these
  // surfaces may offer a join then.
  const spaceEnded =
    session.endedSpaceIds.includes(post.id) ||
    post.status === PostStatus.ended ||
    data?.data.status === PostStatus.ended

  // Teach the store whenever server data reveals the end: it tears down any
  // lingering session for this post (e.g. a reconnect loop racing a dead
  // space) and permanently blocks start() for it. Idempotent.
  useEffect(() => {
    if (spaceEnded) spaceSession.markSpaceEnded(post.id)
  }, [spaceEnded, post.id])

  // Auto-join for listeners — at most once per dialog view. The ref is
  // deliberately never re-armed: a session that resets to idle mid-view
  // (space ended, user removed, backgrounded tab written off by the server)
  // must not silently rejoin, or the space UI closes and reopens by itself
  // in a loop. Rejoining is the manual Join/Rejoin button below.
  useEffect(() => {
    const token = data?.token
    if (
      token &&
      shouldAutoJoinSpace({
        isHost,
        isPostLive: isLiveStatus && !spaceEnded,
        sessionStatus: session.status,
        hasToken: true,
        alreadyAttempted: joinAttemptedRef.current,
      })
    ) {
      joinAttemptedRef.current = true
      setConnectionToken(token)
      setWebsocketUrl(draftWebsocketURL)
      startSpace(token).catch((error) => {
        console.error('Failed to auto-join space:', error)
        toast.error('Failed to join space')
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, isLiveStatus, session.status, data])

  // Start-space mutation (host). Flips the post to live, then connects WebRTC.
  const startSpaceMutation = useMutation({
    mutationFn: () =>
      PostsApi.updatePostById.fn({
        postId: post.id,
        status: SpaceStatus.live,
      }),
    onSuccess: async (response: any) => {
      toast.success('Space started', { id: 'start-space' })

      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPostById.key({ postId: post.id }),
      })
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPosts.key,
      })

      if (response?.token) {
        setConnectionToken(response.token)
        setWebsocketUrl(draftWebsocketURL)
        try {
          await startSpace(response.token)
          toast.success('Connected to space')
        } catch (error) {
          console.error('Failed to connect to space:', error)
          toast.error('Failed to connect to space')
        }
      } else {
        console.error('No token in start-space response')
        toast.error('Invalid space configuration')
      }
    },
    onMutate: () => {
      toast.loading('Starting the space...', { id: 'start-space' })
    },
    onError: (error) => {
      console.error('Failed to start space:', error)
      toast.error('Unable to start the space', { id: 'start-space' })
    },
  })

  const isBusy = startSpaceMutation.isPending || endSpace.isPending

  const handleStartEndSpace = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (spaceStatus) {
      startSpaceMutation.mutate()
    } else {
      // Ending from the dialog also closes it; the persistent bar disappears on
      // its own once the session resets.
      endSpace.mutate(undefined, { onSuccess: onClose })
    }
  }

  const handleJoinSpace = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (spaceEnded) {
      toast.error('This space has ended')
      return
    }
    if (!data) return
    const token = data.token
    if (!token) {
      console.error('Missing connection token for join')
      toast.error('Unable to join: Connection details missing')
      return
    }

    setConnectionToken(token)
    setWebsocketUrl(draftWebsocketURL)
    try {
      toast.loading('Joining space...', { id: 'join-space' })
      await startSpace(token)
      toast.success('Joined space', { id: 'join-space' })
    } catch (error) {
      console.error('Error joining space:', error)
      toast.error('Failed to join space', { id: 'join-space' })
    }
  }

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    spaceSession.toggleMute()
  }

  // Host moderation — optimistic locally, relayed to the target by the server.
  const handleMutePeer = (peerId: string, name: string) => {
    spaceSession.mutePeer(peerId)
    toast.success(`Muted ${name}`)
  }

  const handleRemovePeer = (peerId: string, name: string) => {
    spaceSession.removePeer(peerId)
    toast.success(`Removed ${name} from the space`)
  }

  const handleBlockPeer = (peerId: string, name: string) => {
    spaceSession.blockPeer(peerId)
    toast.success(`Blocked ${name} from this space`)
  }

  const handleRequestMic = (e: React.MouseEvent) => {
    e.stopPropagation()
    spaceSession.requestMic()
    toast.success('Request sent — the host will let you in')
  }

  const handleApproveMicRequest = (peerId: string, name: string) => {
    spaceSession.approveMicRequest(peerId)
    toast.success(`${name} can speak now`)
  }

  const handleDenyMicRequest = (peerId: string, name: string) => {
    spaceSession.denyMicRequest(peerId)
    toast.info(`Declined ${name}'s request`)
  }

  return (
    <div className="space-y-4">
      {isConnected && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-sm font-medium text-green-800">
                Connected to space
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-700">
              <Users className="h-3 w-3" />
              <span>{participantCount} participant(s)</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-green-600">
            {canSpeak
              ? `Your audio is ${isMuted ? 'muted' : 'live'}`
              : "You're listening — request the mic below to speak"}
          </p>
          <p className="mt-1 text-xs text-green-700/80">
            You can close this popup — the space keeps running. Keep this tab
            open to stay live.
          </p>
        </div>
      )}

      {isReconnecting && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            <span className="text-sm font-medium text-amber-800">
              Reconnecting to space…
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-700">
            Hold on, we&apos;ll have you back in a moment.
          </p>
        </div>
      )}

      {spaceEnded && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              This space has ended
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            The host has closed this space. It can no longer be joined.
          </p>
        </div>
      )}

      {!spaceEnded && status === 'failed' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-red-800">
              Disconnected from space
            </span>
          </div>
          <p className="mt-1 text-xs text-red-700">
            We couldn&apos;t reconnect automatically. Tap Rejoin to try again.
          </p>
        </div>
      )}

      {isLiveStatus &&
        !spaceEnded &&
        !isConnected &&
        !isReconnecting &&
        status !== 'failed' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-sm font-medium text-red-800">
                Space is Live
              </span>
            </div>
          </div>
        )}

      {isConnected && isModerator && (
        <MicRequestPanel
          requests={micRequests}
          onApprove={handleApproveMicRequest}
          onDeny={handleDenyMicRequest}
        />
      )}

      {(isConnected || isReconnecting) && (
        <SpaceParticipants
          hostId={post.createdBy}
          hostPresent={hostPresent}
          currentUser={userData}
          peerIds={activePeerIds}
          viewerCanModerate={isModerator}
          micRequests={micRequests}
          isSelfMuted={isMuted}
          peerMicStates={peerMicStates}
          reactions={reactions}
          localStream={spaceSession.getLocalStream()}
          remoteStreams={remoteStreams}
          onMutePeer={handleMutePeer}
          onRemovePeer={handleRemovePeer}
          onBlockPeer={handleBlockPeer}
        />
      )}

      {isConnected && (
        <ReactionPicker
          onReact={(emoji) => spaceSession.sendReaction(emoji, userData?.id)}
        />
      )}

      {isConnected && !canSpeak && (
        <div className="flex gap-2">
          <Button
            onClick={handleRequestMic}
            disabled={hasRequestedMic}
            className={cn(
              'flex-1',
              hasRequestedMic
                ? 'border-gray-200 bg-gray-100 text-gray-500'
                : 'border-blue-300 bg-blue-50 hover:bg-blue-100',
            )}
          >
            <Hand className="mr-2 h-4 w-4" />
            {hasRequestedMic ? 'Request sent — waiting…' : 'Request to speak'}
          </Button>
        </div>
      )}

      {isConnected && canSpeak && (
        <div className="flex gap-2">
          <Button
            onClick={handleToggleMute}
            className={cn(
              'flex-1',
              isMuted
                ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
                : 'border-green-300 bg-green-50 hover:bg-green-100',
            )}
          >
            {isMuted ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Unmute
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Mute
              </>
            )}
          </Button>
        </div>
      )}

      {isHost && !spaceEnded && (
        <div className="mt-6 text-center">
          <Button
            onClick={handleStartEndSpace}
            disabled={isBusy}
            className={cn(
              'w-full gap-2 text-white',
              spaceStatus
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-rose-500 hover:bg-rose-600',
            )}
          >
            {isBusy ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {spaceStatus ? 'Starting...' : 'Ending...'}
              </>
            ) : spaceStatus ? (
              <>
                <Play className="h-4 w-4" />
                Start now
              </>
            ) : (
              <>
                <CircleX className="h-4 w-4" />
                End space
              </>
            )}
          </Button>
        </div>
      )}

      {shouldOfferManualJoin({
        isPostLive: isLiveStatus,
        spaceEnded,
        sessionStatus: status,
      }) && (
        <div className="mt-6 text-center">
          <Button
            onClick={handleJoinSpace}
            disabled={!data}
            className="w-full gap-2 bg-green-600 text-white hover:bg-green-700"
          >
            <Play className="h-4 w-4" />
            {/* A host is by definition returning to their own running space. */}
            {isHost || status === 'failed' ? 'Rejoin Space' : 'Join Space'}
          </Button>
        </div>
      )}

      {import.meta.env.DEV && (
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer text-gray-500">Debug Info</summary>
          <div className="mt-2 space-y-1 rounded bg-gray-100 p-3">
            <p>Space ID: {post.id}</p>
            <p>Post Status: {post.status}</p>
            <p>Session Status: {status}</p>
            <p>Active Post: {session.activePostId ?? 'None'}</p>
            <p>Is Connected: {isConnected ? 'Yes' : 'No'}</p>
            <p>Is Reconnecting: {isReconnecting ? 'Yes' : 'No'}</p>
            <p>Token: {connectionToken ? 'Present' : 'None'}</p>
            <p>WebSocket URL: {websocketUrl || 'None'}</p>
            <p>Remote Streams: {remoteStreams.length}</p>
            <p>Peers: {peerIds.join(', ') || 'None'}</p>
            <p>Is Muted: {isMuted ? 'Yes' : 'No'}</p>
          </div>
        </details>
      )}
    </div>
  )
}
