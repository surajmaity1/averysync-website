import { PostsApi } from '@/api/posts/posts.api'
import { Post } from '@/api/posts/posts.types'
import { UsersAPI } from '@/api/users/users.api'
import { Button } from '@/components/ui/button'
import { cn } from '@/libs/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Mic, PlusCircle, Share2, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Shimmer } from '../common/shimmer'
import { CreatedUpdatePostDialog } from './create-update-post-dialog'
import { PostHeader } from './post-card-header'
import { ReminderCard } from './reminder'

type CardProps = {
  className: string
  post: Post
  onClick: any
}

export const Card = ({ className = '', post, onClick }: CardProps) => {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: UsersAPI.getUserById.key({ userId: post.createdBy }),
    queryFn: () => UsersAPI.getUserById.fn({ userId: post.createdBy }),
  })

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    toast.info('Like feature coming soon!')
  }

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    toast.info('Comment feature coming soon!')
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    toast.info('Share feature coming soon!')
  }

  return (
    <article
      className={cn(
        'mx-auto mb-6 max-w-md cursor-pointer items-center space-x-1 overflow-hidden rounded-lg border border-gray-300 shadow-lg transition-colors',
        post.type == 'SPACE' && 'bg-blue-50',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 px-4 pt-4">
        {user ? (
          <PostHeader post={post} user={user} />
        ) : (
          <>
            {/* Avatar shimmer */}
            <Shimmer className="animate-shimmer h-10 w-10 rounded-full bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 bg-[length:200%_100%] shadow-sm" />

            {/* Name + date shimmer */}
            <div className="flex flex-1 items-center gap-2">
              <Shimmer className="animate-shimmer h-4 w-24 rounded bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%]" />
              <Shimmer className="animate-shimmer h-3 w-20 rounded bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%]" />
            </div>
          </>
        )}
      </div>

      {post.type === 'SPACE' && (
        <div className="px-4 pt-4">
          <span className="inline-flex items-center space-x-1 rounded-full bg-blue-300 px-3 py-1 text-xs font-semibold text-white">
            <Mic size={20} className="ml-1" />
            <span>Upcoming Space</span>
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 px-4 pb-4">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {post.title}
        </h2>
        <p className="text-base text-gray-700">{post.description}</p>
      </div>

      {/* Set Reminder Section — only for SPACE type */}
      {post.type === 'SPACE' && (
        <div className="mt-4 flex justify-center">
          <ReminderCard postId={post.id} />
        </div>
      )}

      {/* Icon Buttons */}
      <div className="flex justify-between border-t border-gray-200 px-4 py-2 text-gray-600">
        <button
          onClick={handleLike}
          className="flex cursor-pointer items-center space-x-1 hover:text-blue-500"
        >
          <ThumbsUp size={20} />
          <span className="text-sm">Like</span>
        </button>
        <button
          onClick={handleComment}
          className="flex cursor-pointer items-center space-x-1 hover:text-blue-500"
        >
          <MessageCircle size={20} />
          <span className="text-sm">Comment</span>
        </button>
        <button
          onClick={handleShare}
          className="flex cursor-pointer items-center space-x-1 hover:text-blue-500"
        >
          <Share2 size={20} />
          <span className="text-sm">Share</span>
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
