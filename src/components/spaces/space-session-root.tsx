import { PostsApi } from '@/api/posts/posts.api'
import { spaceSession, useSpaceSession } from '@/utils/space-session-store'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { PersistentSpaceBar } from './persistent-space-bar'

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
 * Mounted once at the app root. Owns the two things that must outlive the space
 * dialog: the audio sink (so remote audio keeps playing after the popup closes)
 * and the persistent control bar.
 */
export function SpaceSessionRoot() {
  const setAudioContainer = useCallback((el: HTMLDivElement | null) => {
    spaceSession.attachAudioContainer(el)
  }, [])

  return (
    <>
      <div ref={setAudioContainer} className="hidden" aria-hidden="true" />
      <PersistentSpaceBar />
      <EndedSpaceCacheSync />
    </>
  )
}
