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
      onClick={() => {
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
    navigator.clipboard.writeText(sharePost.url!)
    toast.success('Link copied to clipboard')
  }

  return (
    <Button
      onClick={handleMenuShare}
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
        <button>
          <MoreVerticalIcon size={20} />
        </button>
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
