import { PostsApi } from '@/api/posts/posts.api'
import { Post } from '@/api/posts/posts.types'
import { cn } from '@/libs/utils'
import { SpaceStatus } from '@/types/post'
import { startStreaming } from '@/utils/space'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CircleX, Play, XIcon } from 'lucide-react'
import { ReactNode } from 'react'
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
      <AlertDialogContent className="bg-gray-50">
        <AlertDialogTitle className="font-semibold">
          {post.title}
        </AlertDialogTitle>
        <AlertDialogDescription className="font-light">
          {post.description}
        </AlertDialogDescription>
        <SpaceDetailView post={post} />
        <Button
          className="absolute top-4 right-4"
          onClick={() => onOpenChange(false)}
        >
          <XIcon />
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  )
}

type SpaceDetailViewProps = {
  post: Post
}

const SpaceDetailView = ({ post }: SpaceDetailViewProps) => {
  const queryClient = useQueryClient()
  const spaceStatus = post.status === 3 || post.status === 1

  const postMutation = useMutation({
    mutationFn: () =>
      PostsApi.updatePostById.fn({
        postId: post.id,
        status: spaceStatus ? SpaceStatus.live : SpaceStatus.ended,
      }),
    onSuccess: async () => {
      toast.success('Space started', { id: 'start-space' })
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPostById.key({ postId: post.id }),
      })

      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPosts.key,
      })

      let websocket: any
      let p2pConnection: any

      await startStreaming(p2pConnection, websocket)
    },
    onMutate: () => {
      toast.loading('Starting the space', { id: 'start-space' })
    },
    onError: (error) => {
      toast.success('Unable to start the space', { id: 'start-space' })
    },
  })

  const handleStarEndSpace = async (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('start space-card.tsx')
    // let websocket: any
    // let p2pConnection: any

    postMutation.mutate()
    // // await startStreaming(p2pConnection, websocket)

    console.log('end space-card.tsx')
    /*
    // const doOffer = async () => {
    //   console.log('Starting negotiation (doOffer)...')
    //   try {
    //     console.log('Creating offer...')
    //     const offer = await p2pConnection.createOffer()
    //     console.log('Setting local description...')
    //     await p2pConnection.setLocalDescription(offer)

    //     console.log('Sending offer via WebSocket...')
    //     websocket.send(
    //       JSON.stringify({
    //         type: 'offer',
    //         sdp: offer.sdp,
    //       }),
    //     )
    //   } catch (e) {
    //     console.error('Error creating offer:', e)
    //   }
    // }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('inside came')
      toast.error(
        'Camera/Mic API is blocked. You must access this site via HTTPS or localhost.',
      )
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    })

    console.log('stream id', stream.id)

    p2pConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    stream.getTracks().forEach((track) => {
      console.log(`Adding track with label: ${track.label}`)
      p2pConnection.addTrack(track, stream)
    })

    p2pConnection.onicecandidate = (event: any) => {
      if (event.candidate) {
        console.log('Sending ICE candidate')
        websocket.send(
          JSON.stringify({ type: 'candidate', candidate: event.candidate }),
        )
      }
    }

    p2pConnection.ontrack = (event: any) => {
      console.log(
        `Remote stream received: ${event.track.label} , ${event.track.kind}`,
      )
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = 'localhost:8999'
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmZmODQ3N2YtMDhiZi00MzczLWIyMWQtMjMxY2VjZDdlNmYxIiwidXNlcm5hbWUiOiJmZmY4NDc3Zi0wOGJmLTQzNzMtYjIxZC0yMzFjZWNkN2U2ZjEiLCJyb29tX2lkIjoiN2YxNjY5YjUtNTVkOC00NmM3LWI2YzgtMjA0OTAzNGZkOTNlIiwiaXNfc3BlYWtlciI6dHJ1ZSwiaXNzIjoiZGphbmdvLWJhY2tlbmQiLCJleHAiOjE3NzE2Mzg2NTEuMTMxMzgyN30.P8BhznQl8QFyHUdDiYrnM7SFy2vmbfOeslIrQwIy3E8'
    const webSocketURL = `${protocol}//${host}/ws?token=${token}`

    websocket = new WebSocket(webSocketURL)

    websocket.onopen = async () => {
      console.log('WebSocket connection opened')
      await doOffer(p2pConnection, websocket)
    }
    console.log('coming 3')
    websocket.onmessage = async (event: any) => {
      const msg = JSON.parse(event.data)
      console.log('Received WebSocket message:', msg.type)
      console.log('coming 3.1')
      if (msg.type === 'answer') {
        console.log("Processing 'answer' message...")
        try {
          await p2pConnection.setRemoteDescription({
            type: 'answer',
            sdp: msg.sdp,
          })
          console.log('Remote description set successfully')
          console.log('Status: WebRTC Connected')
          console.log('coming 4')
          postMutation.mutate()
        } catch (err) {
          console.error('SetRemoteDescription Error:', err)
        }
      } else if (msg.type === 'candidate') {
        console.log('Received ICE candidate')
        try {
          await p2pConnection.addIceCandidate(msg.candidate)
        } catch (e) {
          console.error('Error adding received ice candidate', e)
        }
      } else if (msg.type === 'negotiate') {
        console.log('Renegotiation requested by server')
        // Avoid race conditions: only renegotiate if we are stable
        if (p2pConnection.signalingState === 'stable') {
          await doOffer(p2pConnection, websocket)
        } else {
          console.log(
            'Ignored renegotiation request because signaling state is ' +
              p2pConnection.signalingState,
          )
        }
      }
    }

    websocket.onerror = (e: any) => {
      console.error('WebSocket error:', e)
    }

    websocket.onclose = () => {
      console.log('WebSocket connection closed')
      p2pConnection.close()
    }
    */
  }

  return (
    <div className="">
      <div className="mt-12 text-center">
        <Button
          onClick={handleStarEndSpace}
          className={cn(
            'gap-2 text-white',
            spaceStatus
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-rose-500 hover:bg-rose-600',
          )}
        >
          {spaceStatus ? (
            <>
              <Play />
              Start Now
            </>
          ) : (
            <>
              <CircleX />
              End
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
