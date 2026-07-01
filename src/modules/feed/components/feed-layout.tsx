import { PostsApi } from '@/api/posts/posts.api'
import { POST_TYPE_ENUM } from '@/api/posts/posts.enum'
import { PostDialog } from '@/components/posts/create-update-post-dialog'
import { TPostFormData } from '@/components/posts/create-update-post-form'
import { useAuth } from '@/hooks/useAuth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Radio } from 'lucide-react'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { toast } from 'sonner'
import { countAuthoredBy, deriveSpacesFromPosts } from '../feed.utils'
import { FeedLeftRail } from './feed-left-rail'
import { FeedRightRail } from './feed-right-rail'
import { FeedTopBar } from './feed-topbar'

/** Subtle radial dot grid behind the page — matches the design system canvas. */
const PAGE_BACKGROUND =
  'radial-gradient(circle, rgb(226 232 240) 1px, transparent 1px)'

type FeedComposeApi = {
  /** Opens the shared create dialog, pre-selecting the post type. */
  openComposer: (type: POST_TYPE_ENUM) => void
}

const FeedComposeContext = createContext<FeedComposeApi | null>(null)

/**
 * Access the shared composer from anywhere inside <FeedLayout>. Lets the feed
 * stream's composer/tabs reuse the exact same create dialog the shell owns.
 */
export const useFeedCompose = (): FeedComposeApi => {
  const ctx = useContext(FeedComposeContext)
  if (!ctx) {
    throw new Error('useFeedCompose must be used within <FeedLayout>')
  }
  return ctx
}

type FeedLayoutProps = {
  /** Center-column content (feed stream or a single post detail). */
  children: ReactNode
}

/**
 * The three-column feed shell shared by the feed list (`/feed`) and the single
 * post view (`/feed/:postId`): sticky top bar, left/right rails, mobile compose
 * FAB, and one shared create-post dialog. Rails are populated from the real
 * posts list; center content is supplied by the caller.
 */
export const FeedLayout = ({ children }: FeedLayoutProps) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [composeType, setComposeType] = useState<POST_TYPE_ENUM>(
    POST_TYPE_ENUM.POST,
  )

  const { data } = useQuery({
    queryKey: PostsApi.getPosts.key,
    queryFn: () => PostsApi.getPosts.fn(),
  })

  const posts = useMemo(() => data?.posts ?? [], [data?.posts])
  const { live, upcoming } = useMemo(
    () => deriveSpacesFromPosts(posts),
    [posts],
  )
  const stats = useMemo(() => countAuthoredBy(posts, user.id), [posts, user.id])

  const createPostMutation = useMutation({
    mutationFn: PostsApi.createPost.fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PostsApi.getPosts.key })
      toast.success('Post created')
      setDialogOpen(false)
    },
    onError: () => {
      toast.error('Unable to create post')
    },
  })

  const openComposer = useCallback((type: POST_TYPE_ENUM) => {
    setComposeType(type)
    setDialogOpen(true)
  }, [])

  const composeApi = useMemo<FeedComposeApi>(
    () => ({ openComposer }),
    [openComposer],
  )

  const handleSubmit = (formData: TPostFormData) => {
    createPostMutation.mutate({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      isRecorded: formData.isRecorded,
    })
  }

  return (
    <FeedComposeContext.Provider value={composeApi}>
      <div
        className="min-h-screen bg-slate-50"
        style={{
          backgroundImage: PAGE_BACKGROUND,
          backgroundSize: '22px 22px',
        }}
      >
        <FeedTopBar
          user={user}
          onStartSpace={() => openComposer(POST_TYPE_ENUM.SPACE)}
        />

        <main className="mx-auto max-w-[1280px] px-4 pt-6 pb-24 md:pb-10 lg:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
            <FeedLeftRail user={user} stats={stats} />

            <section className="flex min-w-0 flex-col gap-5">
              {children}
            </section>

            <FeedRightRail liveSpaces={live} upcomingSpaces={upcoming} />
          </div>
        </main>

        {/* Mobile compose FAB — desktop uses the top bar / composer CTAs. */}
        <button
          type="button"
          aria-label="Create post"
          onClick={() => openComposer(POST_TYPE_ENUM.POST)}
          className="fixed right-5 bottom-20 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-300 transition-transform hover:scale-105 hover:bg-blue-700 md:hidden"
        >
          <Radio className="h-6 w-6" />
        </button>

        {/* Single shared create dialog, controlled by every compose entry point. */}
        <PostDialog
          open={dialogOpen}
          mode="create"
          isMutationPending={createPostMutation.isPending}
          defaultData={{ type: composeType }}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
        >
          <span className="hidden" />
        </PostDialog>
      </div>
    </FeedComposeContext.Provider>
  )
}
