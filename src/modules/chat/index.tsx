import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/libs/utils'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { FeedTopBar } from '../feed/components/feed-topbar'
import { ChatThread } from './components/chat-thread'
import { ConversationList } from './components/conversation-list'
import { MessageRequestList } from './components/message-request-list'
import { useChatState } from './use-chat-state'

const DESKTOP_QUERY = '(min-width: 768px)'

/** Tracks whether the viewport is at the desktop (two-pane) breakpoint. */
const useIsDesktop = (): boolean => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia(DESKTOP_QUERY).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}

type ChatProps = {
  /** Conversation to open on load — the profile → chat "Message" hand-off. */
  initialConversationId?: string
}

export const Chat = ({ initialConversationId }: ChatProps = {}) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  const {
    conversations: ordered,
    activeId,
    activeConversation,
    requests,
    requestCount,
    query,
    setQuery,
    openConversation,
    closeConversation,
    sendMessage,
    acceptRequest,
    declineRequest,
  } = useChatState()

  // Whether the detail pane is showing the message-requests inbox instead of a
  // conversation thread.
  const [showRequests, setShowRequests] = useState(false)
  const [handledInitial, setHandledInitial] = useState(false)

  // Open the conversation handed off from the profile "Message" button, once.
  useEffect(() => {
    if (initialConversationId && !handledInitial) {
      setShowRequests(false)
      openConversation(initialConversationId)
      setHandledInitial(true)
    }
    // openConversation is stable enough for this mount-time hand-off.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId, handledInitial])

  // Desktop always shows a thread: default to the most recent conversation.
  // Mobile starts on the list (activeId null) until the user taps a row.
  useEffect(() => {
    if (
      isDesktop &&
      activeId === null &&
      ordered.length > 0 &&
      !initialConversationId
    ) {
      openConversation(ordered[0].id)
    }
    // openConversation is stable enough for this mount-time default.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, activeId, ordered])

  const selectConversation = (id: string) => {
    setShowRequests(false)
    openConversation(id)
  }

  const handleAcceptRequest = (id: string) => {
    setShowRequests(false)
    acceptRequest(id)
  }

  // The detail pane is "open" (mobile: covering the list) for either a thread
  // or the requests inbox.
  const detailOpen = activeId !== null || showRequests
  const listVisibility = detailOpen ? 'hidden md:flex' : 'flex'
  const detailVisibility = detailOpen ? 'flex' : 'hidden md:flex'

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-slate-50">
      <FeedTopBar user={user} onStartSpace={() => navigate({ to: '/feed' })} />

      <main className="mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 overflow-hidden px-0 pb-12 sm:px-4 sm:pb-4 md:pb-0 lg:px-6">
        <div className="flex min-h-0 w-full overflow-hidden border-slate-200 bg-white shadow-sm sm:rounded-3xl sm:border">
          <ConversationList
            conversations={ordered}
            activeId={activeId}
            onSelect={selectConversation}
            query={query}
            onQueryChange={setQuery}
            requestCount={requestCount}
            onOpenRequests={() => setShowRequests(true)}
            className={cn(
              'w-full md:w-[360px] md:flex-shrink-0 md:border-r',
              listVisibility,
            )}
          />

          {showRequests ? (
            <MessageRequestList
              requests={requests}
              onAccept={handleAcceptRequest}
              onDecline={declineRequest}
              onBack={() => setShowRequests(false)}
              className={cn('w-full md:flex-1', detailVisibility)}
            />
          ) : (
            <ChatThread
              conversation={activeConversation}
              onBack={closeConversation}
              onSend={sendMessage}
              className={cn('w-full md:flex-1', detailVisibility)}
            />
          )}
        </div>
      </main>
    </div>
  )
}
