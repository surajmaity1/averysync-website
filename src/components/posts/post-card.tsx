import { PostsApi } from '@/api/posts/posts.api'
import { Post } from '@/api/posts/posts.types'
import { UsersAPI } from '@/api/users/users.api'
import { Button } from '@/components/ui/button'
import { cn } from '@/libs/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, PlusCircle, Share2, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { MiniSpaceStatusView } from '../spaces/mini-space-status'
import { CreatedUpdatePostDialog } from './create-update-post-dialog'
import { PostHeader } from './post-card-header'
import { PostOptionsMenu } from './post-option-menu'
import { ReminderCard } from './reminder'

type CardProps = {
  className: string
  post: Post
  onClick: any
}

export const Card = ({ className = '', post, onClick }: CardProps) => {
  const { data: user } = useQuery({
    queryKey: UsersAPI.getUserById.key({ userId: post.createdBy }),
    queryFn: () => UsersAPI.getUserById.fn({ userId: post.createdBy }),
  })

  const { data: currentLoggedInUser } = useQuery({
    queryKey: UsersAPI.getUserInfo.key,
    queryFn: UsersAPI.getUserInfo.fn,
  })

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    toast.info('Like feature coming soon!')
  }

  const handleComment = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    toast.info('Comment feature coming soon!')
  }

  const handleFooterShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/feed/${post.id}`)
    toast.success('Link copied to clipboard')
  }

  const handleMenuEdit = () => {
    toast.success('edit feature coming soon!')
  }

  const handleMenuDelete = () => {
    toast.error('Deleted feature coming soon!')
  }

  const handleMenuShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/feed/${post.id}`)
    toast.success('Link copied to clipboard')
  }

  return (
    <article
      className={cn(
        'mx-auto mb-6 max-w-md cursor-pointer rounded-lg border border-gray-300 bg-white shadow-lg transition-colors',
        post.type === 'SPACE' && 'bg-blue-50/50',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between px-4 pt-4">
        <div className="flex items-center gap-3">
          {user ? (
            <PostHeader post={post} user={user} />
          ) : (
            <>
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />

              <div className="flex flex-col gap-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            </>
          )}
        </div>
        <PostOptionsMenu
          onEdit={handleMenuEdit}
          onDelete={handleMenuDelete}
          onShare={handleMenuShare}
          manage={post.createdBy === currentLoggedInUser?.id}
        />
      </div>

      {post.type === 'SPACE' && <MiniSpaceStatusView choice={post.status} />}

      <div className="p-4">
        <h2 className="mb-2 text-xl leading-snug font-semibold text-gray-900">
          {post.title}
        </h2>
        <p className="line-clamp-3 text-base text-gray-700">
          {post.description}
        </p>
      </div>

      {post.type === 'SPACE' && (
        <div className="mt-2 mb-4 flex justify-center px-4">
          <ReminderCard post={post} />
        </div>
      )}

      <div className="flex justify-between rounded-b-lg border-t border-gray-100 bg-gray-50/50 px-4 py-3 text-gray-500">
        <button
          type="button"
          onClick={handleLike}
          className="group flex items-center gap-1.5 transition-colors hover:text-blue-600"
        >
          <ThumbsUp
            size={18}
            className="transition-transform group-active:scale-90"
          />
          <span className="text-sm font-medium">Like</span>
        </button>

        <button
          type="button"
          onClick={handleComment}
          className="group flex items-center gap-1.5 transition-colors hover:text-blue-600"
        >
          <MessageCircle
            size={18}
            className="transition-transform group-active:scale-90"
          />
          <span className="text-sm font-medium">Comment</span>
        </button>

        <button
          type="button"
          onClick={handleFooterShare}
          className="group flex items-center gap-1.5 transition-colors hover:text-blue-600"
        >
          <Share2
            size={18}
            className="transition-transform group-active:scale-90"
          />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </article>
  )
}

interface EmptyCardProps {
  className?: string
  defaultData?: any
}

export const EmptyCard = ({ className = '', defaultData }: EmptyCardProps) => {
  const queryClient = useQueryClient()
  const [showCreatePostForm, setShowCreatePostForm] = useState(false)

  const createPostMutation = useMutation({
    mutationFn: PostsApi.createPost.fn,
    onSuccess: () => {
      toast.success('Post created')
      setShowCreatePostForm(false)
      void queryClient.invalidateQueries({ queryKey: PostsApi.getPosts.key })
    },
    onError: () => {
      toast.error('Unable to create post')
    },
  })

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <article
        className={cn(
          'flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center shadow-sm transition-all hover:border-blue-400 hover:shadow-md',
          className,
        )}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <PlusCircle size={28} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Create your first post
          </h2>
          <p className="text-sm text-gray-500">
            You haven’t created any posts yet. Click below to share something
            new!
          </p>

          {/* Create Post Dialog inside */}
          <CreatedUpdatePostDialog
            open={showCreatePostForm}
            isMutationPending={createPostMutation.isPending}
            onSubmit={(data) => {
              createPostMutation.mutate({
                title: data.title,
                description: data.description,
                type: data.type,
                isRecorded: data.isRecorded,
              })
            }}
            onOpenChange={setShowCreatePostForm}
            mode="create"
            defaultData={defaultData}
          >
            <Button
              onClick={() => setShowCreatePostForm(true)}
              className="mt-3 rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              Create Post
            </Button>
          </CreatedUpdatePostDialog>
        </div>
      </article>
    </div>
  )
}
