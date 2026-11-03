import {
  DropDownMenu,
  DropDownMenuContent,
  DropDownMenuItem,
  DropDownMenuPortal,
  DropDownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigate } from '@tanstack/react-router'
import { Ban, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useBlockActions } from '../use-block-actions'
import { BlockConfirmDialog } from './block-confirm-dialog'

type ProfileActionsMenuProps = {
  userId: string
  name: string
}

/**
 * Overflow menu for another member's profile. Blocking is destructive and,
 * per the backend, makes the profile a 404 afterwards — so it goes behind a
 * confirmation and the caller is returned to the feed on success.
 */
export const ProfileActionsMenu = ({
  userId,
  name,
}: ProfileActionsMenuProps) => {
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { block, isBlocking } = useBlockActions({
    onBlocked: () => navigate({ to: '/feed' }),
  })

  return (
    <>
      <DropDownMenu>
        <DropDownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Profile options"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </DropDownMenuTrigger>
        <DropDownMenuPortal>
          <DropDownMenuContent
            align="end"
            sideOffset={6}
            className="z-[75] min-w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            <DropDownMenuItem
              onSelect={() => setConfirmOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition-colors outline-none select-none hover:bg-red-50 focus:bg-red-50"
            >
              <Ban className="h-4 w-4" />
              Block {name}
            </DropDownMenuItem>
          </DropDownMenuContent>
        </DropDownMenuPortal>
      </DropDownMenu>

      {confirmOpen && (
        <BlockConfirmDialog
          name={name}
          isBlocking={isBlocking}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => block(userId, name)}
        />
      )}
    </>
  )
}
