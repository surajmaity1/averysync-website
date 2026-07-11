import { UsersAPI } from '@/api/users/users.api'
import { useQuery } from '@tanstack/react-query'
import { Check, Hand, X } from 'lucide-react'
import { AvatarUser } from '../ui/avatar'
import { Button } from '../ui/button'

type MicRequestPanelProps = {
  /** Pending requester peer ids, oldest first. */
  requests: string[]
  onApprove: (peerId: string, name: string) => void
  onDeny: (peerId: string, name: string) => void
}

/**
 * Host/cohost view of pending "request to speak" asks. Each row resolves the
 * requester's profile (same per-user query the participant avatars use, so
 * the cache is shared) and offers Approve / Deny.
 */
export const MicRequestPanel = ({
  requests,
  onApprove,
  onDeny,
}: MicRequestPanelProps) => {
  if (requests.length === 0) return null

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-blue-700">
        <Hand className="h-3.5 w-3.5" />
        <span>
          Requests to speak · {requests.length} pending
        </span>
      </div>
      <div className="space-y-2">
        {requests.map((peerId) => (
          <MicRequestRow
            key={peerId}
            peerId={peerId}
            onApprove={onApprove}
            onDeny={onDeny}
          />
        ))}
      </div>
    </div>
  )
}

type MicRequestRowProps = {
  peerId: string
  onApprove: (peerId: string, name: string) => void
  onDeny: (peerId: string, name: string) => void
}

const MicRequestRow = ({ peerId, onApprove, onDeny }: MicRequestRowProps) => {
  const { data: user } = useQuery({
    queryKey: UsersAPI.getUserById.key({ userId: peerId }),
    queryFn: () => UsersAPI.getUserById.fn({ userId: peerId }),
    staleTime: 5 * 60 * 1000,
  })
  const displayName = user?.name ?? 'Listener'

  return (
    <div className="flex items-center gap-2 rounded-md bg-white p-2">
      <AvatarUser src={user?.image} name={user?.name} size={32} />
      <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
        {displayName}
      </span>
      <Button
        aria-label={`Allow ${displayName} to speak`}
        onClick={() => onApprove(peerId, displayName)}
        className="h-8 gap-1 bg-green-600 px-2.5 text-xs text-white hover:bg-green-700"
      >
        <Check className="h-3.5 w-3.5" />
        Allow
      </Button>
      <Button
        aria-label={`Decline ${displayName}'s request`}
        onClick={() => onDeny(peerId, displayName)}
        className="h-8 gap-1 bg-gray-200 px-2.5 text-xs text-gray-700 hover:bg-gray-300"
      >
        <X className="h-3.5 w-3.5" />
        Decline
      </Button>
    </div>
  )
}
