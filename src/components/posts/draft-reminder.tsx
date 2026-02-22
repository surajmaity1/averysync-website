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
  const [openListenerDialog, setOpenListenerDialog] = useState(false)

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

    // If space has ended
    if (post.status === PostStatus.ended) {
      setOpenStartSpaceDialog(false)
      toast.success('View details coming soon')
      return
    }

    // Check if user is the creator/host
    const isHost = userData?.id === post.createdBy

    // If user is the host
    if (isHost) {
      setOpenStartSpaceDialog(true)
      return
    }

    // If user is NOT the host and space is LIVE
    if (post.status === PostStatus.live) {
      console.log('Non-host user joining live space:', post.id)
      setOpenListenerDialog(true)
      return
    }

    // Otherwise, toggle reminder (for scheduled spaces)
    reminderMutation.mutate()
  }

  if (isLoading) {
    return <ReminderButtonSkeleton />
  }

  const isHost = userData?.id === post.createdBy
  console.log('button clicked 1')

  return (
    <>
      <Button
        onClick={handleSetReminder}
        className={cn(
          'mb-4 flex items-center justify-center space-x-2 rounded-2xl px-6 py-2 text-white transition-all',
          reminder?.data.isReminderSet
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-500 hover:bg-blue-600',
          post.status === PostStatus.live &&
            'bg-rose-100 hover:bg-rose-200 hover:text-white',
          post.status === PostStatus.ended
            ? 'bg-gray-400 hover:bg-gray-500'
            : '',
        )}
      >
        {reminderButtonLoadingText || isUserDataLoading ? (
          <>
            <Loader size={18} className="animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {isHost ? (
              // HOST VIEW
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
            ) : (
              // NON-HOST VIEW
              <>
                {post.status === PostStatus.ended ? (
                  <>
                    <BadgeInfo size={18} />
                    View Details
                  </>
                ) : post.status === PostStatus.live ? (
                  <>
                    <span className="h-5 w-5 animate-pulse rounded-full bg-rose-500"></span>
                    <span className="font-bold text-rose-500">Join LIVE</span>
                  </>
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
          </>
        )}
      </Button>

      {/* Listener Dialog - Opens when non-host clicks on live space */}
      {/* {!isHost && (
        <ListenerSpaceDialog
          open={openListenerDialog}
          onOpenChange={setOpenListenerDialog}
          post={post}
        />
      )} */}
    </>
  )
}
