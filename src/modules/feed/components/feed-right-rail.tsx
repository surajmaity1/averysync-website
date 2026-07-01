import { Post } from '@/api/posts/posts.types'
import { UsersAPI } from '@/api/users/users.api'
import { AvatarUser } from '@/components/ui/avatar'
import { cn } from '@/libs/utils'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  CalendarClock,
  Headphones,
  Radio,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { SAMPLE_SUGGESTIONS, SAMPLE_TRENDING } from '../feed.constants'
import { FeedRailCard } from './feed-rail-card'

type FeedRightRailProps = {
  liveSpaces: Post[]
  upcomingSpaces: Post[]
}

const useHostName = (userId: string) => {
  const { data } = useQuery({
    queryKey: UsersAPI.getUserById.key({ userId }),
    queryFn: () => UsersAPI.getUserById.fn({ userId }),
    enabled: Boolean(userId),
  })
  return data
}

const LivePulse = () => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
  </span>
)

const SpaceRow = ({ post, live }: { post: Post; live: boolean }) => {
  const host = useHostName(post.createdBy)

  return (
    <Link
      to="/feed/$postId"
      params={{ postId: post.id }}
      className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-slate-50"
    >
      <div className="relative flex-shrink-0">
        {live ? (
          <AvatarUser src={host?.image} name={host?.name} size={40} />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
            <CalendarClock
              className="h-4 w-4 text-blue-600"
              strokeWidth={2.2}
            />
          </span>
        )}
        {live && (
          <span className="absolute -right-0.5 -bottom-0.5 flex rounded-full bg-white p-0.5">
            <LivePulse />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">
          {post.title}
        </p>
        <p className="truncate text-xs text-slate-500">
          {host?.name || 'Averysync member'}
          {live && (
            <>
              {' · '}
              <Headphones className="inline h-3 w-3 -translate-y-px text-slate-400" />{' '}
              Live
            </>
          )}
        </p>
      </div>
      {live && (
        <span className="flex-shrink-0 rounded-full bg-green-600 px-3 py-1.5 text-xs font-bold text-white">
          Join
        </span>
      )}
    </Link>
  )
}

const FollowRow = ({ name, role }: { name: string; role: string }) => (
  <div className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-slate-50">
    <AvatarUser name={name} size={40} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-bold text-slate-900">{name}</p>
      <p className="truncate text-xs text-slate-500">{role}</p>
    </div>
    <button
      type="button"
      onClick={() => toast.info('Following coming soon!')}
      className="flex-shrink-0 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-800"
    >
      Follow
    </button>
  </div>
)

const EmptyHint = ({ children }: { children: string }) => (
  <p className="px-2 py-3 text-xs text-slate-400">{children}</p>
)

export const FeedRightRail = ({
  liveSpaces,
  upcomingSpaces,
}: FeedRightRailProps) => {
  return (
    <aside className="sticky top-[88px] hidden max-h-[calc(100vh-104px)] flex-col gap-4 overflow-y-auto pb-2 xl:flex">
      <FeedRailCard title="Live now" icon={Radio}>
        {liveSpaces.length > 0 ? (
          <div className="flex flex-col gap-1">
            {liveSpaces.map((post) => (
              <SpaceRow key={post.id} post={post} live />
            ))}
          </div>
        ) : (
          <EmptyHint>No spaces are live right now.</EmptyHint>
        )}
      </FeedRailCard>

      <FeedRailCard title="Upcoming spaces" icon={CalendarClock}>
        {upcomingSpaces.length > 0 ? (
          <div className="flex flex-col gap-1">
            {upcomingSpaces.map((post) => (
              <SpaceRow key={post.id} post={post} live={false} />
            ))}
          </div>
        ) : (
          <EmptyHint>No upcoming spaces scheduled yet.</EmptyHint>
        )}
      </FeedRailCard>

      <FeedRailCard title="Who to follow" icon={UserPlus}>
        <div className="flex flex-col gap-1">
          {SAMPLE_SUGGESTIONS.map((person) => (
            <FollowRow
              key={person.name}
              name={person.name}
              role={person.role}
            />
          ))}
        </div>
      </FeedRailCard>

      <FeedRailCard title="Trending topics" icon={TrendingUp}>
        <div className="flex flex-col">
          {SAMPLE_TRENDING.map((topic, index) => (
            <button
              key={topic.tag}
              type="button"
              onClick={() => toast.info('Topic pages coming soon!')}
              className="flex items-center gap-2.5 rounded-2xl p-2 text-left transition-colors hover:bg-slate-50"
            >
              <span className="w-4 text-sm font-bold text-slate-400">
                {index + 1}
              </span>
              <span className="flex-1 text-sm font-semibold text-slate-900">
                #{topic.tag}
              </span>
              <span className="text-xs text-slate-400">
                {topic.posts} posts
              </span>
            </button>
          ))}
        </div>
      </FeedRailCard>

      <p className={cn('px-3 text-xs leading-loose text-slate-400')}>
        © 2026 Averysync
      </p>
    </aside>
  )
}
