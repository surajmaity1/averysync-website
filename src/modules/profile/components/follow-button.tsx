import { TRelationship } from '@/api/follow/follow.types'
import { cn } from '@/libs/utils'
import { followActionFor } from '../follow.utils'
import { useFollowActions } from '../use-follow-actions'

type FollowButtonProps = {
  userId: string
  relationship?: TRelationship | null
}

/**
 * The profile's single follow control. Label and intent derive from the
 * viewer's relationship; hidden on the viewer's own profile and on legacy
 * payloads without relationship data.
 */
export const FollowButton = ({ userId, relationship }: FollowButtonProps) => {
  const { follow, unfollow, isMutatingEdge } = useFollowActions(userId)
  const action = followActionFor(relationship)

  if (!action) return null

  return (
    <button
      type="button"
      disabled={isMutatingEdge}
      onClick={action.intent === 'follow' ? follow : unfollow}
      className={cn(
        'inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        action.emphasis === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      {action.label}
    </button>
  )
}
