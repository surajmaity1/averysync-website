import { PostsApi } from '@/api/posts/posts.api'
import { Post } from '@/api/posts/posts.types'
import { cn } from '@/libs/utils'
import { SpaceStatus } from '@/types/post'
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
        status: spaceStatus ? SpaceStatus.started : SpaceStatus.ended,
      }),
    onSuccess: () => {
      toast.success('Space started', { id: 'start-space' })
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPostById.key({ postId: post.id }),
      })

      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPosts.key,
      })
    },
    onMutate: () => {
      toast.loading('Starting the space', { id: 'start-space' })
    },
    onError: (error) => {
      toast.success('Unable to start the space', { id: 'start-space' })
    },
  })

  const handleStarEndSpace = () => {
    postMutation.mutate()
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
