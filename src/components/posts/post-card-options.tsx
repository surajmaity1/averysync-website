import { PostsApi } from '@/api/posts/posts.api'
import { Post } from '@/api/posts/posts.types'
import { Button } from '@/components/ui/button'
import {
  DropDownMenu,
  DropDownMenuContent,
  DropDownMenuItem,
  DropDownMenuPortal,
  DropDownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/libs/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { MoreVerticalIcon, Share, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
      className="bg-rose-300 hover:bg-rose-400"
      disabled={deletePostMutation.isPending}
      onClick={(e) => {
        e.stopPropagation()
        deletePostMutation.mutate({
          postId: postId,
        })
      }}
    >
      <Trash2 />
    </Button>
  )
}

type SharePostButtonProps = {
  postId: string
  postTitle: string
  postDescription?: string
}

const SharePostButton = ({
  postId,
  postTitle,
  postDescription,
}: SharePostButtonProps) => {
  const handleMenuShare = () => {
    const sharePost: ShareData = {
      title: postTitle,
      text: postDescription,
      url: `${window.location.origin}/feed/${postId}`,
    }

    navigator.share(sharePost)
  }

  return (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        handleMenuShare()
      }}
      className="bg-green-300 hover:bg-green-400"
    >
      <Share />
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
    <DropDownMenu>
      <DropDownMenuTrigger>
        <Button
          className={cn(
            post.type === 'POST'
              ? 'bg-gray-50 hover:bg-gray-100'
              : 'bg-blue-50 hover:bg-blue-100',
          )}
        >
          <MoreVerticalIcon size={20} />
        </Button>
      </DropDownMenuTrigger>
      <DropDownMenuPortal>
        <DropDownMenuContent>
          {postOwner && (
            <>
              <DropDownMenuItem>
                <UpdatePostButton post={post} />
              </DropDownMenuItem>
              <DropDownMenuItem>
                <DeletePostButton postId={post.id} />
              </DropDownMenuItem>
            </>
          )}
          <DropDownMenuItem>
            <SharePostButton
              postId={post.id}
              postTitle={post.title}
              postDescription={post.description}
            />
          </DropDownMenuItem>
        </DropDownMenuContent>
      </DropDownMenuPortal>
    </DropDownMenu>
  )
}
