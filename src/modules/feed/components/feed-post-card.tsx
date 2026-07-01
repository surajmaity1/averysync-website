import { POST_TYPE_ENUM } from '@/api/posts/posts.enum'
import { Post } from '@/api/posts/posts.types'
import { UsersAPI } from '@/api/users/users.api'
import { PostCardOptionsButton } from '@/components/posts/post-card-options'
import { ReminderCard } from '@/components/posts/reminder'
import { AvatarUser } from '@/components/ui/avatar'
import { cn, formatPostDate } from '@/libs/utils'
import { PostStatus } from '@/types/post'
import { useQuery } from '@tanstack/react-query'
import {
  Clock,
  LucideIcon,
  MessageCircle,
  Share2,
  ThumbsUp,
} from 'lucide-react'
import { toast } from 'sonner'

type FeedPostCardProps = {
  post: Post
  /** Navigate to the post detail. Omitted in `detail` mode. */
  onClick?: () => void
  /**
   * Detail mode renders the post statically (no hover-lift, no click-through)
   * with the full, un-truncated description — used on `/feed/:postId`.
   */
  detail?: boolean
}

type StatusPill = {
  label: string
  className: string
  icon?: LucideIcon
  pulse?: boolean
}

const SPACE_STATUS_PILL: Record<number, StatusPill> = {
  [PostStatus.scheduled]: {
    label: 'Upcoming space',
    className: 'text-blue-600',
    icon: Clock,
  },
  [PostStatus.live]: {
    label: 'Live space',
    className: 'text-rose-600',
    pulse: true,
  },
  [PostStatus.ended]: { label: 'Past space', className: 'text-slate-500' },
  [PostStatus.closed]: {
    label: 'Cancelled space',
    className: 'text-slate-500',
  },
}

const SpaceStatusRow = ({ status }: { status?: number }) => {
  const pill = status ? SPACE_STATUS_PILL[status] : undefined
  if (!pill) return null

  const Icon = pill.icon

  return (
    <div className="mb-3.5">
      <span
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm',
          pill.className,
        )}
      >
        {pill.pulse ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </span>
        ) : (
          Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
        )}
        {pill.label}
      </span>
    </div>
  )
}

const PostHeader = ({ post }: { post: Post }) => {
  const { data: author } = useQuery({
    queryKey: UsersAPI.getUserById.key({ userId: post.createdBy }),
    queryFn: () => UsersAPI.getUserById.fn({ userId: post.createdBy }),
    enabled: Boolean(post.createdBy),
  })

  const { data: currentUser } = useQuery({
    queryKey: UsersAPI.getUserInfo.key,
    queryFn: UsersAPI.getUserInfo.fn,
  })

  const isSpace = post.type === POST_TYPE_ENUM.SPACE

  return (
    <div className="mb-3.5 flex items-center gap-3">
      <AvatarUser src={author?.image} name={author?.name} size={44} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="truncate">{author?.name || 'Averysync member'}</span>
          <span
            className={cn(
              'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase',
              isSpace
                ? 'bg-blue-50 text-blue-600'
                : 'bg-slate-100 text-slate-500',
            )}
          >
            {isSpace ? 'Host' : 'Author'}
          </span>
        </span>
        <span className="text-xs text-slate-400">
          {formatPostDate(post.createdAt)}
        </span>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <PostCardOptionsButton
          post={post}
          postOwner={post.createdBy === currentUser?.id}
        />
      </div>
    </div>
  )
}

const FooterAction = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
  >
    <Icon
      className="h-[18px] w-[18px] transition-transform group-active:scale-90"
      strokeWidth={2}
    />
    <span>{label}</span>
  </button>
)

export const FeedPostCard = ({
  post,
  onClick,
  detail = false,
}: FeedPostCardProps) => {
  const isSpace = post.type === POST_TYPE_ENUM.SPACE

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    toast.info('Like feature coming soon!')
  }

  const handleComment = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    toast.info('Comment feature coming soon!')
  }

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/feed/${post.id}`)
    toast.success('Link copied to clipboard')
  }

  return (
    <article
      onClick={detail ? undefined : onClick}
      className={cn(
        'group overflow-hidden rounded-3xl border shadow-sm transition-all duration-300',
        !detail &&
          'cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50',
        isSpace
          ? cn(
              'border-blue-100 bg-blue-50 ring-4 ring-blue-50',
              !detail && 'hover:border-blue-200',
            )
          : cn(
              'border-slate-200 bg-white',
              !detail && 'hover:border-slate-300',
            ),
      )}
    >
      <div className={cn('px-6 pt-5', isSpace ? 'pb-5' : 'pb-1')}>
        {isSpace && <SpaceStatusRow status={post.status} />}
        <PostHeader post={post} />

        <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-900">
          {post.title}
        </h2>
        {post.description && (
          <p
            className={cn(
              'text-base leading-relaxed text-slate-600',
              detail ? 'whitespace-pre-line' : 'line-clamp-3',
            )}
          >
            {post.description}
          </p>
        )}

        {isSpace && (
          <div
            className="mt-4 flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <ReminderCard post={post} />
          </div>
        )}
      </div>

      {!isSpace && (
        <div className="mt-3.5 flex items-center gap-1 border-t border-slate-100 bg-slate-50/60 px-4 py-2">
          <FooterAction icon={ThumbsUp} label="Like" onClick={handleLike} />
          <FooterAction
            icon={MessageCircle}
            label="Comment"
            onClick={handleComment}
          />
          <FooterAction icon={Share2} label="Share" onClick={handleShare} />
        </div>
      )}
    </article>
  )
}
