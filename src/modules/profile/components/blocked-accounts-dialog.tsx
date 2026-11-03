import { BlockApi } from '@/api/block/block.api'
import { TBlockUser } from '@/api/block/block.types'
import { Shimmer } from '@/components/common/shimmer'
import { AvatarUser } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { UserX, X } from 'lucide-react'
import { useEffect } from 'react'
import { useBlockActions } from '../use-block-actions'

type BlockedAccountsDialogProps = {
  onClose: () => void
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

const BlockedUserRow = ({
  user,
  onUnblock,
}: {
  user: TBlockUser
  onUnblock: () => void
}) => (
  <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <AvatarUser src={user.image ?? undefined} name={user.name} size={40} />
      <span className="truncate text-sm font-semibold text-slate-900">
        {user.name}
      </span>
    </div>
    <button
      type="button"
      aria-label={`Unblock ${user.name}`}
      onClick={onUnblock}
      className="cursor-pointer rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      Unblock
    </button>
  </li>
)

/**
 * Own-profile management of the caller's active blocks (`GET /v1/blocks`).
 * This is the only place a block can be lifted — a blocked user's profile is
 * a 404, so there is no per-profile unblock control.
 */
export const BlockedAccountsDialog = ({
  onClose,
}: BlockedAccountsDialogProps) => {
  const { unblock } = useBlockActions()

  const { data, isLoading, error } = useQuery({
    queryKey: BlockApi.listBlocks.key,
    queryFn: () => BlockApi.listBlocks.fn(),
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const blocks = data?.data ?? []

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
        aria-label="Blocked accounts"
        className="relative flex max-h-[70vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold tracking-tight text-slate-900">
            Blocked accounts
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
          ) : error ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <UserX className="h-5 w-5 text-slate-500" />
              </span>
              <p className="text-sm font-bold text-slate-900">
                Could not load your blocked accounts
              </p>
              <p className="max-w-xs text-sm text-slate-500">
                Something went wrong. Please try again.
              </p>
            </div>
          ) : blocks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <UserX className="h-5 w-5 text-slate-500" />
              </span>
              <p className="text-sm font-bold text-slate-900">
                You haven't blocked anyone
              </p>
              <p className="max-w-xs text-sm text-slate-500">
                People you block will show up here.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col py-2">
              {blocks.map((user) => (
                <BlockedUserRow
                  key={user.id}
                  user={user}
                  onUnblock={() => unblock(user.id, user.name)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
