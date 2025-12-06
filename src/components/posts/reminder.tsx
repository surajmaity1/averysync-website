import { PostsApi } from '@/api/posts/posts.api'
import { cn } from '@/libs/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Shimmer } from '../common/shimmer'
import { Button } from '../ui/button'

const ReminderButtonSkeleton = () => {
  return (
    <div className="mt-4 flex justify-center">
      <Shimmer className="mb-4 h-10 w-36 rounded-2xl bg-blue-500" />
    </div>
  )
}

type ReminderProps = {
  className?: string
  postId: string
}

export const ReminderCard = ({ className = '', postId }: ReminderProps) => {
  const queryClient = useQueryClient()

  const { data: reminder, isLoading } = useQuery({
    queryKey: PostsApi.getSpaceReminderById.key({ postId: postId }),
    queryFn: () => PostsApi.getSpaceReminderById.fn({ postId: postId }),
  })

  const reminderMutation = useMutation({
    mutationFn: () =>
      PostsApi.createUpdateSpaceReminderById.fn({
        postId: postId,
        isReminderSet: !reminder?.data?.isReminderSet,
      }),
    onMutate: () => {
      toast.loading('Setting Reminder...', { id: 'reminder-toast' })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getSpaceReminderById.key({ postId: postId }),
      })
      toast.success('Reminder set successfully!', { id: 'reminder-toast' })
    },

    onError: () => {
      toast.error('Failed to set reminder', { id: 'reminder-toast' })
    },
  })

  const handleSetReminder = (e: React.MouseEvent) => {
    e.stopPropagation()
    reminderMutation.mutate()
  }

  if (isLoading) {
    return <ReminderButtonSkeleton />
  }

  return (
    <Button
      onClick={handleSetReminder}
      className={cn(
        'mb-4 flex items-center space-x-2 rounded-2xl px-6 py-2 text-white transition-all',
        reminder?.data.isReminderSet
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-blue-500 hover:bg-blue-600',
      )}
    >
      {reminder?.data.isReminderSet ? (
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
    </Button>
  )
}
