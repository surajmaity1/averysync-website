import { PostsApi } from '@/api/posts/posts.api'
import { Post } from '@/api/posts/posts.types'
import { UsersAPI } from '@/api/users/users.api'
import { cn } from '@/libs/utils'
import { SpaceStatus } from '@/types/post'
import { useSpaceStreaming } from '@/utils/stream'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleX, Mic, MicOff, Play, Users, XIcon } from 'lucide-react'
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

type SpaceAlertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: Post
  children: ReactNode
}

const draftWebsocketURL = 'https://staging-stream.averysync.com/ws'

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
          className="absolute top-4 right-4"
          onClick={() => onOpenChange(false)}
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
  const [isSpaceLive, setIsSpaceLive] = useState(false)
  const [connectionToken, setConnectionToken] = useState<string | null>(null)
  const [websocketUrl, setWebsocketUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLDivElement>(null)
  const isLiveRef = useRef(false)
  const joinAttemptedRef = useRef(false)

  const {
    startSpace,
    stopSpace,
    toggleMute,
    isConnected,
    isMuted,
    remoteStreams,
  } = useSpaceStreaming()

  const spaceStatus = post.status === 3 || post.status === 1
  const isLiveStatus = post.status === 2

  const { data: userData } = useQuery({
    queryKey: UsersAPI.getUserInfo.key,
    queryFn: UsersAPI.getUserInfo.fn,
  })
  const isHost = userData?.id === post.createdBy

  // Fetch post data to get token for listeners
  const { data } = useQuery({
    queryKey: PostsApi.getPostById.key({ postId: post.id }),
    queryFn: () => PostsApi.getPostById.fn({ postId: post.id }),
    enabled: !isHost && isLiveStatus,
  })

  // Auto-join for listeners
  useEffect(() => {
    if (
      !isHost &&
      isLiveStatus &&
      !isConnected &&
      data &&
      !joinAttemptedRef.current
    ) {
      const spaceData = (data as any)?.data || data
      const token = data?.token
      console.log('token 11', token)
      const wsUrl = draftWebsocketURL

      if (token && wsUrl) {
        joinAttemptedRef.current = true
        setConnectionToken(token)
        setWebsocketUrl(wsUrl)
        startSpace(token, wsUrl)
        setIsSpaceLive(true)
      }
    }
  }, [isHost, isLiveStatus, isConnected, data, startSpace])

  // Start/Update space mutation
  const startSpaceMutation = useMutation({
    mutationFn: () =>
      PostsApi.updatePostById.fn({
        postId: post.id,
        status: SpaceStatus.live,
      }),
    onSuccess: async (response: any) => {
      toast.success('Space started', { id: 'start-space' })

      // Invalidate queries
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPostById.key({ postId: post.id }),
      })
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPosts.key,
      })

      // Extract token and websocket URL from response
      if (response?.token) {
        const token = response?.token
        const websocket_url = draftWebsocketURL

        // Update state
        setConnectionToken(response.token)
        setWebsocketUrl(websocket_url)

        // Connect to WebRTC
        try {
          await startSpace(response.token, websocket_url)
          setIsSpaceLive(true)
          toast.success('Connected to space')
        } catch (error) {
          console.error('Failed to connect to space:', error)
          toast.error('Failed to connect to space')
        }
      } else {
        console.error('No token or websocket URL in response')
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

  // End space mutation
  const endSpaceMutation = useMutation({
    mutationFn: () =>
      PostsApi.updatePostById.fn({
        postId: post.id,
        status: SpaceStatus.ended,
      }),
    onSuccess: async () => {
      toast.success('Space ended', { id: 'end-space' })

      // Cleanup WebRTC connections
      stopSpace()
      setIsSpaceLive(false)
      setConnectionToken(null)
      setWebsocketUrl(null)

      // Invalidate queries
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPostById.key({ postId: post.id }),
      })
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPosts.key,
      })

      // Close dialog
      onClose()
    },
    onMutate: () => {
      toast.loading('Ending the space...', { id: 'end-space' })
    },
    onError: (error) => {
      console.error('Failed to end space:', error)
      toast.error('Unable to end the space', { id: 'end-space' })
    },
  })

  // Handle start/end space button click
  const handleStartEndSpace = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (spaceStatus) {
      // Start the space
      startSpaceMutation.mutate()
    } else {
      // End the space
      endSpaceMutation.mutate()
    }
  }

  // Handle join space for listeners
  const handleJoinSpace = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (data) {
      const spaceData = (data as any)?.data || data
      const token = data.token
      // console.log('spaceData', spaceData)
      // console.log('token', token)

      const wsUrl = draftWebsocketURL
      // console.log('wsUrl', wsUrl)

      if (token && wsUrl) {
        setConnectionToken(token)
        setWebsocketUrl(wsUrl)
        try {
          toast.loading('Joining space...', { id: 'join-space' })
          await startSpace(token, wsUrl)
          setIsSpaceLive(true)
          toast.success('Joined space', { id: 'join-space' })
        } catch (error) {
          console.error('Error joining space:', error)
          toast.error('Failed to join space', { id: 'join-space' })
        }
      } else {
        console.error('Missing connection details:', spaceData)
        toast.error('Unable to join: Connection details missing')
      }
    }
  }

  // Handle mute toggle
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleMute()
  }

  // Cleanup on unmount
  useEffect(() => {
    isLiveRef.current = isSpaceLive || isConnected
  }, [isSpaceLive, isConnected])

  useEffect(() => {
    return () => {
      if (isLiveRef.current) {
        stopSpace()
      }
    }
  }, [])

  // Play remote audio streams
  useEffect(() => {
    if (audioRef.current && remoteStreams.length > 0) {
      audioRef.current.innerHTML = ''
      remoteStreams.forEach((stream, index) => {
        const audio = document.createElement('audio')
        audio.srcObject = stream
        audio.autoplay = true
        audio.id = `remote-audio-${index}`
        audioRef.current?.appendChild(audio)
      })
    }
  }, [remoteStreams])

  return (
    <div className="space-y-4">
      {/* Hidden Audio Container */}
      <div ref={audioRef} className="hidden" />

      {/* Connection Status Banner */}
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
              <span>{remoteStreams.length + 1} participant(s)</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-green-600">
            Your audio is {isMuted ? 'muted' : 'live'}
          </p>
        </div>
      )}

      {/* Live Indicator */}
      {isLiveStatus && !isConnected && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-sm font-medium text-red-800">
              Space is Live
            </span>
          </div>
        </div>
      )}

      {/* Audio Controls (when connected) */}
      {isConnected && (
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

      {/* Main Action Button */}
      {isHost && (
        <div className="mt-6 text-center">
          <Button
            onClick={handleStartEndSpace}
            disabled={
              startSpaceMutation.isPending || endSpaceMutation.isPending
            }
            className={cn(
              'w-full gap-2 text-white',
              spaceStatus
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-rose-500 hover:bg-rose-600',
            )}
          >
            {startSpaceMutation.isPending || endSpaceMutation.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {spaceStatus ? 'Starting...' : 'Ending...'}
              </>
            ) : spaceStatus ? (
              <>
                <Play className="h-4 w-4" />
                Start Now
              </>
            ) : (
              <>
                <CircleX className="h-4 w-4" />
                End Space
              </>
            )}
          </Button>
        </div>
      )}

      {/* Join Button for Non-Hosts */}
      {!isHost && isLiveStatus && !isConnected && (
        <div className="mt-6 text-center">
          <Button
            onClick={handleJoinSpace}
            disabled={!data}
            className="w-full gap-2 bg-green-600 text-white hover:bg-green-700"
          >
            <Play className="h-4 w-4" />
            Join Space
          </Button>
        </div>
      )}

      {/* Debug Info (only in development) */}
      {
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer text-gray-500">Debug Info</summary>
          <div className="mt-2 space-y-1 rounded bg-gray-100 p-3">
            <p>Space ID: {post.id}</p>
            <p>Status: {post.status}</p>
            <p>Is Connected: {isConnected ? 'Yes' : 'No'}</p>
            <p>Is Live: {isSpaceLive ? 'Yes' : 'No'}</p>
            <p>Token: {connectionToken ? 'Present' : 'None'}</p>
            <p>WebSocket URL: {websocketUrl || 'None'}</p>
            <p>Remote Streams: {remoteStreams.length}</p>
            <p>Is Muted: {isMuted ? 'Yes' : 'No'}</p>
          </div>
        </details>
      }
    </div>
  )
}
