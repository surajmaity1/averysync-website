import { PostsApi } from '@/api/posts/posts.api'
import { Post } from '@/api/posts/posts.types'
import { cn } from '@/libs/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
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
  post: Post
}

export const ReminderCard = ({ className = '', post }: ReminderProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: PostsApi.getSpaceReminderById.key({ postId: post.id }),
    queryFn: () => PostsApi.getSpaceReminderById.fn({ postId: post.id }),
  })

  const reminderMutation = useMutation({
    mutationFn: () =>
      PostsApi.createUpdateSpaceReminderById.fn({
        postId: post.id,

        isReminderSet: true,
      }),

    onMutate: () => {
      toast.loading('Setting Reminder...', { id: 'reminder-toast' })
    },

    onSuccess: (data) => {
      toast.success('Reminder set successfully!', { id: 'reminder-toast' })
    },

    onError: (error) => {
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
        data?.isReminderSet
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-blue-500 hover:bg-blue-600',
      )}
    >
      {data?.isReminderSet ? (
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
