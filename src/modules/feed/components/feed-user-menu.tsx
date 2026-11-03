import { TUser } from '@/api/users/users.type'
import { AvatarUser } from '@/components/ui/avatar'
import {
  DropDownMenu,
  DropDownMenuContent,
  DropDownMenuItem,
  DropDownMenuPortal,
  DropDownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigate } from '@tanstack/react-router'
import { User } from 'lucide-react'

type FeedUserMenuProps = {
  user: TUser
}

/**
 * Top-bar account menu. The avatar is the trigger; opening it reveals the
 * viewer's own actions — currently just "Profile", which routes to their own
 * profile page (`/$userId` with their own id).
 */
export const FeedUserMenu = ({ user }: FeedUserMenuProps) => {
  const navigate = useNavigate()

  return (
    <DropDownMenu>
      <DropDownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Your profile"
          className="ml-1 flex rounded-full transition-transform hover:scale-105"
        >
          <AvatarUser src={user.image} name={user.name} size={36} />
        </button>
      </DropDownMenuTrigger>
      <DropDownMenuPortal>
        <DropDownMenuContent
          align="end"
          sideOffset={8}
          className="z-[75] min-w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          <DropDownMenuItem
            onSelect={() =>
              navigate({ to: '/$userId', params: { userId: user.id } })
            }
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors outline-none select-none hover:bg-slate-50 focus:bg-slate-50"
          >
            <User className="h-4 w-4" />
            Profile
          </DropDownMenuItem>
        </DropDownMenuContent>
      </DropDownMenuPortal>
    </DropDownMenu>
  )
}
