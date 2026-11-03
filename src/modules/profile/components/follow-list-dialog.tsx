import { FollowApi } from '@/api/follow/follow.api'
import { TFollowUser } from '@/api/follow/follow.types'
import { Shimmer } from '@/components/common/shimmer'
import { AvatarUser } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { Lock, UserX, X } from 'lucide-react'
import { useEffect } from 'react'
import { useFollowActions } from '../use-follow-actions'

export type FollowListKind = 'followers' | 'following'

type FollowListDialogProps = {
  userId: string
  kind: FollowListKind
  /** Own-profile followers rows get a remove control. */
  isOwnProfile: boolean
  onClose: () => void
}

const KIND_TITLE: Record<FollowListKind, string> = {
  followers: 'Followers',
  following: 'Following',
}

const ListSkeleton = () => (
  <div className="flex flex-col gap-3 p-4">
    {[0, 1, 2].map((row) => (
      <div key={row} className="flex items-center gap-3">
        <Shimmer className="h-10 w-10 rounded-full" />
        <Shimmer className="h-4 w-40 rounded-full" />
      </div>
    ))}
  </div>
)

const EmptyState = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) => (
  <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
      {icon}
    </span>
    <p className="text-sm font-bold text-slate-900">{title}</p>
    <p className="max-w-xs text-sm text-slate-500">{subtitle}</p>
  </div>
)

const FollowUserRow = ({
  user,
  removable,
  onRemove,
  onNavigate,
}: {
  user: TFollowUser
  removable: boolean
  onRemove: () => void
  onNavigate: () => void
}) => (
  <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
    <Link
      to="/$userId"
      params={{ userId: user.id }}
      onClick={onNavigate}
      className="flex min-w-0 flex-1 items-center gap-3"
    >
      <AvatarUser src={user.image ?? undefined} name={user.name} size={40} />
      <span className="truncate text-sm font-semibold text-slate-900">
        {user.name}
      </span>
    </Link>
    {removable && (
      <button
        type="button"
        aria-label={`Remove ${user.name}`}
        onClick={onRemove}
        className="cursor-pointer rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        Remove
      </button>
    )}
  </li>
)

/**
 * Modal list of a profile's followers or following. A backend 403 is the
 * follower-list privacy gate for private profiles the viewer doesn't follow.
 */
export const FollowListDialog = ({
  userId,
  kind,
  isOwnProfile,
  onClose,
}: FollowListDialogProps) => {
  const { removeFollower } = useFollowActions(userId)

  const api =
    kind === 'followers' ? FollowApi.listFollowers : FollowApi.listFollowing
  const { data, isLoading, error } = useQuery({
    queryKey: api.key({ userId }),
    queryFn: () => api.fn({ userId }),
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const isPrivateList = isAxiosError(error) && error.response?.status === 403

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={KIND_TITLE[kind]}
        className="relative flex max-h-[70vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold tracking-tight text-slate-900">
            {KIND_TITLE[kind]}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-y-auto">
          {isLoading ? (
            <ListSkeleton />
          ) : isPrivateList ? (
            <EmptyState
              icon={<Lock className="h-5 w-5 text-slate-500" />}
              title="This account is private"
              subtitle="Follow this account to see who they connect with."
            />
          ) : error || !data ? (
            <EmptyState
              icon={<UserX className="h-5 w-5 text-slate-500" />}
              title="Could not load this list"
              subtitle="Something went wrong. Please try again."
            />
          ) : data.data.length === 0 ? (
            <EmptyState
              icon={<UserX className="h-5 w-5 text-slate-500" />}
              title={`No ${KIND_TITLE[kind].toLowerCase()} yet`}
              subtitle="When connections appear, they will show up here."
            />
          ) : (
            <ul className="flex flex-col py-2">
              {data.data.map((user) => (
                <FollowUserRow
                  key={user.id}
                  user={user}
                  removable={isOwnProfile && kind === 'followers'}
                  onRemove={() => removeFollower(user.id, user.name)}
                  onNavigate={onClose}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
