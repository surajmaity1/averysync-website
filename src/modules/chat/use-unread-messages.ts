import { ChatApi } from '@/api/chat/chat.api'
import { useQuery } from '@tanstack/react-query'

/**
 * The number of conversations with unread messages — one per person who has
 * messaged the user and whom they haven't read yet. Drives the badge on every
 * message icon. Polls periodically and on window focus since v1 has no realtime
 * push; the badge clears when a conversation is opened (see `useChatState`).
 */
export const useUnreadMessages = (): { count: number } => {
  const { data } = useQuery({
    queryKey: ChatApi.unreadCount.key,
    queryFn: ChatApi.unreadCount.fn,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  return { count: data ?? 0 }
}
