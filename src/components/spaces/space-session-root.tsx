import { PostsApi } from '@/api/posts/posts.api'
import { refocusOnClose } from '@/utils/space-dialog-focus'
import { spaceSession, useSpaceSession } from '@/utils/space-session-store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import {
  PersistentSpaceBar,
  SPACE_BAR_REOPEN_BUTTON_ID,
} from './persistent-space-bar'
import { SpaceAlertDialog } from './space-card'

/**
 * When the session store learns a space has ended (space_ended broadcast, the
 * host ending it, or markSpaceEnded from fresh server data), the feed and any
 * open dialogs on THIS client may still hold a stale "live" post in the query
 * cache — leaving a Join button pointing at a dead space. Invalidate the
 * affected queries once per newly-ended space so every surface refetches
 * server truth.
 */
const EndedSpaceCacheSync = () => {
  const { endedSpaceIds } = useSpaceSession()
  const queryClient = useQueryClient()
  const syncedIdsRef = useRef<ReadonlySet<string>>(new Set())

  useEffect(() => {
    const freshIds = endedSpaceIds.filter((id) => !syncedIdsRef.current.has(id))
    if (freshIds.length === 0) return

    syncedIdsRef.current = new Set(endedSpaceIds)
    for (const postId of freshIds) {
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPostById.key({ postId }),
      })
    }
    void queryClient.invalidateQueries({ queryKey: PostsApi.getPosts.key })
  }, [endedSpaceIds, queryClient])

  return null
}

/**
 * The space dialog for the ACTIVE session, mounted at the app root and driven
 * by the store's isDialogOpen flag. Feed cards own their own dialog for
 * starting/joining a space, but their open state dies with the card — this is
 * the one instance the persistent bar can always reopen, from any page.
 */
const ActiveSpaceDialog = ({ postId }: { postId: string }) => {
  const { isDialogOpen } = useSpaceSession()

  // The bar only knows the post id; the dialog needs the full post.
  const { data } = useQuery({
    queryKey: PostsApi.getPostById.key({ postId }),
    queryFn: () => PostsApi.getPostById.fn({ postId }),
  })
  const post = data?.data

  if (!post) return null

  // No trigger children: this dialog is opened programmatically from the bar.
  // A sentinel trigger here would sit at the end of <body>, and Radix's close
  // focus-return would scroll the page to the bottom to reach it. On close,
  // focus goes back to the bar's reopen button instead — resolved at close
  // time, and null-safe for closes caused by the session ending.
  return (
    <SpaceAlertDialog
      open={isDialogOpen}
      onOpenChange={(open) =>
        open ? spaceSession.openDialog() : spaceSession.closeDialog()
      }
      post={post}
      onCloseAutoFocus={refocusOnClose(() =>
        document.getElementById(SPACE_BAR_REOPEN_BUTTON_ID),
      )}
    />
  )
}

/**
 * Mounted once at the app root. Owns the things that must outlive the space
 * dialog: the audio sink (so remote audio keeps playing after the popup
 * closes), the persistent control bar, and the reopenable active-space dialog.
 */
export function SpaceSessionRoot() {
  const { activePostId } = useSpaceSession()

  const setAudioContainer = useCallback((el: HTMLDivElement | null) => {
    spaceSession.attachAudioContainer(el)
  }, [])

  return (
    <>
      <div ref={setAudioContainer} className="hidden" aria-hidden="true" />
      <PersistentSpaceBar />
      {activePostId && <ActiveSpaceDialog postId={activePostId} />}
      <EndedSpaceCacheSync />
    </>
  )
}
