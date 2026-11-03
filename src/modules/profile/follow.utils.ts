import { TRelationship } from '@/api/follow/follow.types'

export type FollowIntent = 'follow' | 'cancel' | 'unfollow'

export type FollowAction = {
  label: 'Follow' | 'Follow back' | 'Requested' | 'Following'
  intent: FollowIntent
  emphasis: 'primary' | 'secondary'
}

/**
 * The single follow button state for a profile, derived from the viewer's
 * relationship. `null` means no button: the viewer's own profile, or a legacy
 * payload without relationship data.
 */
export const followActionFor = (
  relationship?: TRelationship | null,
): FollowAction | null => {
  if (!relationship) return null

  switch (relationship.status) {
    case 'NONE':
      return {
        label: relationship.followsYou ? 'Follow back' : 'Follow',
        intent: 'follow',
        emphasis: 'primary',
      }
    case 'PENDING':
      return { label: 'Requested', intent: 'cancel', emphasis: 'secondary' }
    case 'FOLLOWING':
      return { label: 'Following', intent: 'unfollow', emphasis: 'secondary' }
    case 'SELF':
      return null
  }
}
