import { UsersAPI } from '@/api/users/users.api'
import { cn } from '@/libs/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'

type PrivacyToggleProps = {
  userId: string
  isPrivate: boolean
}

/**
 * Own-profile switch for `PATCH /v1/users?profile=true`. Flipping to private
 * makes new follows require approval; existing followers are unaffected.
 */
export const PrivacyToggle = ({ userId, isPrivate }: PrivacyToggleProps) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: UsersAPI.updateProfile.fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: UsersAPI.getUserById.key({ userId }),
      })
    },
    onError: () => toast.error('Could not update your profile privacy.'),
  })

  return (
    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
        <Lock className="h-4 w-4 text-slate-600" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">Private account</p>
        <p className="text-xs text-slate-500">
          New followers must be approved by you.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isPrivate}
        aria-label="Private account"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate({ isPrivate: !isPrivate })}
        className={cn(
          'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60',
          isPrivate ? 'bg-blue-600' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            isPrivate && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}
