import { Post } from '@/api/posts/posts.types'
import { Play, XIcon } from 'lucide-react'
import { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Button } from '../ui/button'
import { useQuery } from '@tanstack/react-query'

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
  return (
    <div className="">
      <div className="mt-12 text-center">
        <Button className="gap-2 bg-blue-500 text-white hover:bg-blue-600">
          <Play />
          Start Now
        </Button>
      </div>
    </div>
  )
}
