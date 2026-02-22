import { PostsApi } from '@/api/posts/posts.api'
import { Post } from '@/api/posts/posts.types'
import { UsersAPI } from '@/api/users/users.api'
import { cn } from '@/libs/utils'
import { PostStatus } from '@/types/post'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, BadgeInfo, Bell, Loader, Podcast } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Shimmer } from '../common/shimmer'
// import { SpaceAlertDialog } from '../spaces/space-card'
import { SpaceAlertDialog } from '../spaces/draft-space-card'
import { Button } from '../ui/button'

const ReminderButtonSkeleton = () => {
  return (
    <div className="flex justify-center">
      <Shimmer className="mb-4 h-8 w-32 rounded-2xl bg-blue-500" />
    </div>
  )
}

type ReminderProps = {
  className?: string
  post: Post
}

export const ReminderCard = ({ className = '', post }: ReminderProps) => {
  const queryClient = useQueryClient()
  const [reminderButtonLoadingText, setReminderButtonLoadingText] =
    useState(false)
  const [openStartSpaceDialog, setOpenStartSpaceDialog] = useState(false)

  const { data: reminder, isLoading } = useQuery({
    queryKey: PostsApi.getSpaceReminderById.key({ postId: post.id }),
    queryFn: () => PostsApi.getSpaceReminderById.fn({ postId: post.id }),
  })

  const {
    data: userData,
    isLoading: isUserDataLoading,
    isError,
  } = useQuery({
    queryKey: UsersAPI.getUserInfo.key,
    queryFn: UsersAPI.getUserInfo.fn,
  })

  const reminderMutation = useMutation({
    mutationFn: () =>
      PostsApi.createUpdateSpaceReminderById.fn({
        postId: post.id,
        isReminderSet: !reminder?.data.isReminderSet,
      }),
    onMutate: () => {
      setReminderButtonLoadingText(true)
      const loadingReminderText = reminder?.data.isReminderSet
        ? 'Removing'
        : 'Setting'
      toast.loading(`${loadingReminderText} Reminder...`, {
        id: 'reminder-toast',
      })
    },
    onSuccess: () => {
      setReminderButtonLoadingText(false)
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getSpaceReminderById.key({ postId: post.id }),
      })
      const loadingReminderText = reminder?.data.isReminderSet
        ? 'removed'
        : 'set'
      toast.success(`Reminder ${loadingReminderText} successfully!`, {
        id: 'reminder-toast',
      })
    },

    onError: () => {
      setReminderButtonLoadingText(false)
      toast.error('Failed to set reminder', { id: 'reminder-toast' })
    },
  })

  const handleSetReminder = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (post.status === PostStatus.ended) {
      // TODO: view details dialog
      setOpenStartSpaceDialog(false)
      toast.success('View details coming soon')
      return
    }

    if (userData?.id === post.createdBy) {
      if (!openStartSpaceDialog) {
        setOpenStartSpaceDialog(true)
      }
      return
    }

    if (post.status === PostStatus.live) {
      setOpenStartSpaceDialog(true)
      return
    }

    reminderMutation.mutate()
  }

  if (isLoading) {
    return <ReminderButtonSkeleton />
  }
  console.log('button clicked 2')

  return (
    <Button
      onClick={handleSetReminder}
      className={cn(
        'mb-4 flex items-center justify-center space-x-2 rounded-2xl px-6 py-2 text-white transition-all',
        reminder?.data.isReminderSet
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-blue-500 hover:bg-blue-600',
        post.status === PostStatus.live &&
          'bg-rose-100 hover:bg-rose-200 hover:text-white',
        post.status === PostStatus.ended ? 'bg-gray-400 hover:bg-gray-500' : '',
      )}
    >
      {reminderButtonLoadingText || isUserDataLoading ? (
        <>
          <Loader size={18} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {userData?.id === post.createdBy ? (
            <SpaceAlertDialog
              open={openStartSpaceDialog}
              onOpenChange={setOpenStartSpaceDialog}
              post={post}
            >
              <>
                {post.status === PostStatus.ended ? (
                  <>
                    <BadgeInfo size={18} />
                    View Details
                  </>
                ) : (
                  <>
                    {post.status === PostStatus.live ? (
                      <>
                        <span className="h-5 w-5 animate-pulse rounded-full bg-rose-500"></span>
                        <span className="font-bold text-rose-500">LIVE</span>
                      </>
                    ) : (
                      <>
                        <Podcast size={18} />
                        <span>Start now</span>
                      </>
                    )}
                  </>
                )}
              </>
            </SpaceAlertDialog>
          ) : post.status === PostStatus.ended ? (
            <>
              <BadgeInfo size={18} />
              View Details
            </>
          ) : post.status === PostStatus.live ? (
            <SpaceAlertDialog
              open={openStartSpaceDialog}
              onOpenChange={setOpenStartSpaceDialog}
              post={post}
            >
              <>
                <span className="h-5 w-5 animate-pulse rounded-full bg-rose-500"></span>
                <span className="font-bold text-rose-500">Join LIVE</span>
              </>
            </SpaceAlertDialog>
          ) : reminder?.data.isReminderSet ? (
            <>
              <BadgeCheck size={18} />
              <span>Reminder set</span>
            </>
          ) : (
            <>
              <Bell size={18} />
              <span>Set Reminder</span>
            </>
          )}
        </>
      )}
    </Button>
  )
}
