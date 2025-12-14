import { Post } from '@/api/posts/posts.types'
import { Play, XIcon } from 'lucide-react'
import { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Button } from '../ui/button'

type SpaceCardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: Post
  children: ReactNode
}

export const SpaceCard = ({
  open,
  onOpenChange,
  post,
  children,
}: SpaceCardProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger className="flex space-x-2">
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-100">
        <AlertDialogTitle className="font-semibold">
          {post.title}
        </AlertDialogTitle>
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
  return (
    <div className="">
      <div className="font-light">{post.description}</div>
      <div className="mt-12 text-center">
        <Button className="gap-2 bg-blue-500 text-white hover:bg-blue-600">
          <Play />
          Start Now
        </Button>
      </div>
    </div>
  )
}
