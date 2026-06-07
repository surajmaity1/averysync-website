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
import { PostDialog } from './create-update-post-dialog'
import { PostHeader } from './post-card-header'
import { PostCardOptionsButton } from './post-card-options'
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

  const isSpace = post.type === 'SPACE'

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40',
        isSpace
          ? 'border-blue-100 bg-blue-50 ring-4 ring-blue-50/30 hover:bg-blue-100'
          : 'border-slate-200 hover:border-slate-300',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between px-6 pt-6">
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
        <PostCardOptionsButton
          post={post}
          postOwner={post.createdBy === currentLoggedInUser?.id}
        />
      </div>

      {isSpace && (
        <div className="px-6 pt-2">
          <MiniSpaceStatusView choice={post.status} />
        </div>
      )}

      <div className="flex-1 px-6 py-4">
        <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-900">
          {post.title}
        </h2>
        <p className="line-clamp-3 text-base leading-relaxed text-slate-600">
          {post.description}
        </p>
      </div>

      {isSpace && (
        <div className="mt-2 mb-6 flex justify-center px-6">
          <ReminderCard post={post} />
        </div>
      )}

      <div
        className={cn(
          'flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-slate-500',
          isSpace && 'hover:bg-blue-100',
        )}
      >
        <button
          type="button"
          onClick={handleLike}
          className="group flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all hover:bg-white hover:text-blue-600 hover:shadow-sm"
        >
          <ThumbsUp
            size={18}
            className="transition-transform duration-300 group-hover:-rotate-12 group-active:scale-90"
          />
          <span>Like</span>
        </button>

        <button
          type="button"
          onClick={handleComment}
          className="group flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all hover:bg-white hover:text-blue-600 hover:shadow-sm"
        >
          <MessageCircle
            size={18}
            className="transition-transform duration-300 group-hover:scale-110 group-active:scale-90"
          />
          <span>Comment</span>
        </button>

        <button
          type="button"
          onClick={handleFooterShare}
          className="group flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all hover:bg-white hover:text-blue-600 hover:shadow-sm"
        >
          <Share2
            size={18}
            className="transition-transform duration-300 group-hover:rotate-12 group-active:scale-90"
          />
          <span>Share</span>
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
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <article
        className={cn(
          'flex w-full max-w-lg flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center transition-all hover:border-blue-300 hover:bg-blue-50/30',
          className,
        )}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <PlusCircle size={32} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Create your first post
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            You haven’t created any posts yet. Click below to share something
            new!
          </p>

          <PostDialog
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
              className="mt-4 rounded-full bg-blue-600 px-8 py-6 text-base font-bold text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-blue-300"
            >
              Create Post
            </Button>
          </PostDialog>
        </div>
      </article>
    </div>
  )
}
