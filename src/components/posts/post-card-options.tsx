import { PostsApi } from '@/api/posts/posts.api'
import { Post } from '@/api/posts/posts.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { LinkIcon, MoreVerticalIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { DropDownMenuTrigger } from '../ui/dropdown-menu'
import { UpdatePostButton } from './update-post-button'

type DeletePostButtonProps = {
  postId: string
}

const DeletePostButton = ({ postId }: DeletePostButtonProps) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const deletePostMutation = useMutation({
    mutationFn: PostsApi.deletePostById.fn,
    onMutate: () => {
      toast.loading('Deleting post ...', { id: 'delete-toast' })
    },
    onSuccess: () => {
      toast.success('Post deleted successfully', { id: 'delete-toast' })
      navigate({
        to: '/feed',
      })
      void queryClient.invalidateQueries({ queryKey: PostsApi.getPosts.key })
    },
    onError: () => {
      toast.error('Unable to delete post', { id: 'delete-toast' })
    },
  })

  return (
    <Button
      onClick={() => {
        deletePostMutation.mutate({
          postId: postId,
        })
      }}
    >
      <Trash2 /> Delete
    </Button>
  )
}

type SharePostButtonProps = {
  postId: string
}

const SharePostButton = ({ postId }: SharePostButtonProps) => {
  const handleMenuShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/feed/${postId}`)
    toast.success('Link copied to clipboard')
  }

  return (
    <Button onClick={handleMenuShare}>
      <LinkIcon /> Share
    </Button>
  )
}

type PostCardOptionsProps = {
  post: Post
  postOwner: boolean
}

export const PostCardOptionsButton = ({
  post,
  postOwner,
}: PostCardOptionsProps) => {
  return (
    <DropdownMenu>
      <DropDownMenuTrigger>
        <MoreVerticalIcon size={20} />
      </DropDownMenuTrigger>
      <DropdownMenuContent>
        {postOwner && (
          <>
            <DropdownMenuItem>
              <UpdatePostButton post={post} />
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DeletePostButton postId={post.id} />
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem>
          <SharePostButton postId={post.id} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
