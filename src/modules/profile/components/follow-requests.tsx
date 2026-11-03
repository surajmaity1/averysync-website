import { FollowApi } from '@/api/follow/follow.api'
import { AvatarUser } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { UserPlus } from 'lucide-react'
import { useFollowActions } from '../use-follow-actions'

type FollowRequestsProps = {
  /** The viewer's own user id — the inbox belongs to the profile owner. */
  userId: string
}

/**
 * Pending follow requests, shown only on the viewer's own profile. Renders
 * nothing while loading or when the inbox is empty.
 */
export const FollowRequests = ({ userId }: FollowRequestsProps) => {
  const { acceptRequest, rejectRequest } = useFollowActions(userId)

  const { data } = useQuery({
    queryKey: FollowApi.listRequests.key,
    queryFn: () => FollowApi.listRequests.fn({}),
  })

  const requests = data?.data ?? []

  if (requests.length === 0) return null

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
          <UserPlus className="h-4 w-4 text-blue-600" />
        </span>
        <h2 className="text-base font-bold tracking-tight text-slate-900">
          Follow requests
        </h2>
        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
          {requests.length}
        </span>
      </div>

      <ul aria-label="Follow requests" className="mt-3 flex flex-col">
        {requests.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 border-t border-slate-100 py-2.5 first:border-t-0"
          >
            <Link
              to="/$userId"
              params={{ userId: user.id }}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <AvatarUser
                src={user.image ?? undefined}
                name={user.name}
                size={40}
              />
              <span className="truncate text-sm font-semibold text-slate-900">
                {user.name}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => acceptRequest(user.id, user.name)}
              className="cursor-pointer rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => rejectRequest(user.id)}
              className="cursor-pointer rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Decline
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
