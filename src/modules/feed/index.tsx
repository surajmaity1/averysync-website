import { PostsApi } from '@/api/posts/posts.api'
import { ErrorPage } from '@/components/common/error-page'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FeedTabKey, filterPostsByTab } from './feed.utils'
import { FeedComposer } from './components/feed-composer'
import { FeedFilterTabs } from './components/feed-filter-tabs'
import { FeedLayout, useFeedCompose } from './components/feed-layout'
import { FeedPostCard } from './components/feed-post-card'
import { FeedSkeleton } from './components/feed-skeleton'

const EmptyStream = () => (
  <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
      <Sparkles className="h-6 w-6 text-blue-600" />
    </span>
    <h3 className="text-lg font-bold tracking-tight text-slate-900">
      Nothing here yet
    </h3>
    <p className="max-w-sm text-sm text-slate-500">
      Be the first to share something with the community or start a live Space.
    </p>
  </div>
)

/** Center column for `/feed`: header, filter tabs, composer, and the stream. */
const FeedStream = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openComposer } = useFeedCompose()

  const [activeTab, setActiveTab] = useState<FeedTabKey>('foryou')

  const { data, isLoading, isError } = useQuery({
    queryKey: PostsApi.getPosts.key,
    queryFn: () => PostsApi.getPosts.fn(),
  })

  const posts = useMemo(() => data?.posts ?? [], [data?.posts])
  const visiblePosts = useMemo(
    () => filterPostsByTab(posts, activeTab),
    [posts, activeTab],
  )

  const openPost = (postId: string) =>
    navigate({ to: '/feed/$postId', params: { postId } })

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Feed
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Catch up on the latest from the community.
          </p>
        </div>
        <FeedFilterTabs active={activeTab} onChange={setActiveTab} />
      </div>

      <FeedComposer user={user} onCompose={openComposer} />

      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <ErrorPage />
      ) : visiblePosts.length === 0 ? (
        <EmptyStream />
      ) : (
        <div className="flex flex-col gap-5">
          {visiblePosts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              onClick={() => openPost(post.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}

export const Feed = () => {
  return (
    <FeedLayout>
      <FeedStream />
    </FeedLayout>
  )
}
