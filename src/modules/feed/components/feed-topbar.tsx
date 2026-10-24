import { POST_TYPE_ENUM } from '@/api/posts/posts.enum'
import { TUser } from '@/api/users/users.type'
import { AvatarUser } from '@/components/ui/avatar'
import { Link } from '@tanstack/react-router'
import { Bell, MessageSquareText, Radio, Search } from 'lucide-react'
import { toast } from 'sonner'

type FeedTopBarProps = {
  user: TUser
  onStartSpace: () => void
}

/** Sticky, glassmorphic top bar — logo · search · actions · avatar. */
export const FeedTopBar = ({ user, onStartSpace }: FeedTopBarProps) => {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1280px] items-center gap-5 px-4 lg:px-6">
        <Link to="/feed" className="flex flex-shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-slate-900/5">
            <img src="/favicon.ico" alt="" width={22} height={22} />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Averysync
          </span>
        </Link>

        <label className="flex h-[42px] max-w-[440px] flex-1 items-center gap-2.5 rounded-full border border-transparent bg-slate-100 px-3.5 transition-colors focus-within:border-slate-200 focus-within:bg-white focus-within:shadow-sm">
          <Search className="h-[18px] w-[18px] text-slate-400" />
          <input
            type="search"
            placeholder="Search spaces, people, topics"
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <nav className="ml-auto flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => toast.info('Notifications coming soon!')}
            className="relative flex h-[42px] w-[42px] items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          <Link
            to="/chats"
            aria-label="Messages"
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <MessageSquareText className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={onStartSpace}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
          >
            <Radio className="h-4 w-4" strokeWidth={2.2} />
            <span className="hidden sm:inline">Start a Space</span>
          </button>

          <button
            type="button"
            aria-label="Your profile"
            className="ml-1 flex rounded-full transition-transform hover:scale-105"
          >
            <AvatarUser src={user.image} name={user.name} size={36} />
          </button>
        </nav>
      </div>
    </header>
  )
}
