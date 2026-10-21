import { TUser } from '@/api/users/users.type'
import { AvatarUser } from '@/components/ui/avatar'
import { cn } from '@/libs/utils'
import { Link } from '@tanstack/react-router'
import {
  Bookmark,
  Hash,
  LucideIcon,
  MessageSquareText,
  Newspaper,
  Radio,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { SAMPLE_TOPICS } from '../feed.constants'
import { FeedRailCard } from './feed-rail-card'

type FeedLeftRailProps = {
  user: TUser
  stats: { posts: number; spaces: number }
}

type NavItem = {
  icon: LucideIcon
  label: string
  to?: '/feed' | '/chats'
  active?: boolean
}

/** Only Feed and Messages map to real routes; the rest are not built yet. */
const NAV_ITEMS: NavItem[] = [
  { icon: Newspaper, label: 'Feed', to: '/feed', active: true },
  { icon: Radio, label: 'Live Spaces' },
  { icon: MessageSquareText, label: 'Messages', to: '/chats' },
  { icon: Bookmark, label: 'Bookmarks' },
  { icon: User, label: 'Profile' },
]

const navItemClass = (active?: boolean) =>
  cn(
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
    active
      ? 'bg-blue-50 font-bold text-blue-600'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  )

const ProfileCard = ({ user, stats }: FeedLeftRailProps) => {
  const handle = user.email ? user.email.split('@')[0] : undefined

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-16 bg-gradient-to-br from-blue-600 to-indigo-600" />
      <div className="flex flex-col px-4 pb-4">
        <AvatarUser
          src={user.image}
          name={user.name}
          size={64}
          className="-mt-9 ring-4 ring-white"
        />
        <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900">
          {user.name || 'Your profile'}
        </h3>
        {handle && <p className="mt-0.5 text-xs text-slate-400">@{handle}</p>}

        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          <Stat value={stats.posts} label="Posts" />
          <Stat value={stats.spaces} label="Spaces" />
        </div>
      </div>
    </section>
  )
}

const Stat = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-1 flex-col gap-0.5">
    <span className="text-base font-bold text-slate-900">{value}</span>
    <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
      {label}
    </span>
  </div>
)

const NavList = () => (
  <nav className="flex flex-col gap-0.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
    {NAV_ITEMS.map(({ icon: Icon, label, to, active }) =>
      to ? (
        <Link key={label} to={to} className={navItemClass(active)}>
          <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
          <span className="flex-1">{label}</span>
        </Link>
      ) : (
        <button
          key={label}
          type="button"
          onClick={() => toast.info(`${label} coming soon!`)}
          className={navItemClass()}
        >
          <Icon className="h-5 w-5" />
          <span className="flex-1 text-left">{label}</span>
        </button>
      ),
    )}
  </nav>
)

export const FeedLeftRail = ({ user, stats }: FeedLeftRailProps) => {
  return (
    <aside className="sticky top-[88px] hidden flex-col gap-4 lg:flex">
      <ProfileCard user={user} stats={stats} />
      <NavList />
      <FeedRailCard
        title="Your frequencies"
        icon={Hash}
        action="Edit"
        onAction={() => toast.info('Editing frequencies coming soon!')}
      >
        <div className="flex flex-wrap gap-2">
          {SAMPLE_TOPICS.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              <span className="font-bold text-slate-400">#</span>
              {topic}
            </span>
          ))}
        </div>
      </FeedRailCard>
      <p className="px-3 text-xs leading-relaxed text-slate-400">
        Averysync · Connect in real-time with global tech minds
      </p>
    </aside>
  )
}
