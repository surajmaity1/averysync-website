import { LikesApi } from '@/api/likes/likes.api'
import { TLikeState } from '@/api/likes/likes.types'
import { PostsApi } from '@/api/posts/posts.api'
import { GetPostsDTO, Post, PostDTO } from '@/api/posts/posts.types'
import { messageOf } from '@/libs/api-error'
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type LikeablePost = Pick<Post, 'id' | 'likeCount' | 'likedByMe'>

type Snapshot = [readonly unknown[], unknown]

/**
 * Writes `state` onto the post wherever it is cached — the feed list and the
 * single-post detail — and returns the prior values so a failed mutation can
 * roll them back. A post/space missing from a cache is simply skipped.
 */
const patchCachedPost = (
  queryClient: QueryClient,
  postId: string,
  state: TLikeState,
): Snapshot[] => {
  const snapshots: Snapshot[] = []

  const listKey = PostsApi.getPosts.key
  const list = queryClient.getQueryData<GetPostsDTO>(listKey)
  if (list) {
    snapshots.push([listKey, list])
    queryClient.setQueryData<GetPostsDTO>(listKey, {
      ...list,
      posts: list.posts.map((post) =>
        post.id === postId
          ? { ...post, likedByMe: state.liked, likeCount: state.likeCount }
          : post,
      ),
    })
  }

  const detailKey = PostsApi.getPostById.key({ postId })
  const detail = queryClient.getQueryData<PostDTO>(detailKey)
  if (detail?.data?.id === postId) {
    snapshots.push([detailKey, detail])
    queryClient.setQueryData<PostDTO>(detailKey, {
      ...detail,
      data: {
        ...detail.data,
        likedByMe: state.liked,
        likeCount: state.likeCount,
      },
    })
  }

  return snapshots
}

/**
 * Like/unlike a post or space with an optimistic cache flip. The button reads
 * `liked`/`likeCount` back from the (cache-backed) `post` it was given, so the
 * optimistic write re-renders it instantly; the server's authoritative count
 * then reconciles on success, and a failure rolls every touched cache back.
 */
export const useLikeActions = (post: LikeablePost) => {
  const queryClient = useQueryClient()

  const liked = post.likedByMe ?? false
  const likeCount = post.likeCount ?? 0

  const mutation = useMutation({
    mutationFn: ({ nextLiked }: { nextLiked: boolean; nextCount: number }) =>
      nextLiked
        ? LikesApi.like.fn({ postId: post.id })
        : LikesApi.unlike.fn({ postId: post.id }),
    onMutate: ({ nextLiked, nextCount }) => {
      const snapshots = patchCachedPost(queryClient, post.id, {
        liked: nextLiked,
        likeCount: nextCount,
      })
      return { snapshots }
    },
    onError: (error, _variables, context) => {
      context?.snapshots.forEach(([key, value]) =>
        queryClient.setQueryData(key, value),
      )
      toast.error(messageOf(error))
    },
    onSuccess: (state) => {
      patchCachedPost(queryClient, post.id, state)
    },
  })

  const toggle = () => {
    const nextLiked = !liked
    const nextCount = Math.max(0, likeCount + (nextLiked ? 1 : -1))
    mutation.mutate({ nextLiked, nextCount })
  }

  return { liked, likeCount, toggle, isPending: mutation.isPending }
}
