import { ChatThread } from '@/modules/chat/components/chat-thread'
import { ConversationList } from '@/modules/chat/components/conversation-list'
import { MessageRequestList } from '@/modules/chat/components/message-request-list'
import { useChatState } from '@/modules/chat/use-chat-state'
import { useRouterState } from '@tanstack/react-router'
import { MessageSquareText, Minus } from 'lucide-react'
import { useState } from 'react'

/**
 * An app-wide floating chat widget — the Luma-style launcher that lives in the
 * bottom-right corner of every authenticated page. It is mounted once in the
 * `_internal` layout (which stays mounted across page changes), so its open
 * state and draft messages survive navigation.
 *
 * It is a single-column, compact surface: a launcher bubble that expands into a
 * panel showing the conversation list, and drills into a thread on tap. The
 * heavy panes (`ConversationList`, `ChatThread`) are reused as-is so the widget
 * and the full `/chat` page stay visually and behaviourally identical.
 *
 * Scope:
 *  - Desktop only (`md:` and up). Mobile already has the bottom-nav entry and a
 *    dedicated full-screen `/chat` page, so a floating overlay there would just
 *    fight the bottom navbar for the same corner.
 *  - Hidden on `/chat` itself, where the full page already owns the experience.
 */
export function FloatingChat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [isOpen, setIsOpen] = useState(false)
  // Which secondary surface the panel is showing when no thread is open.
  const [view, setView] = useState<'list' | 'requests'>('list')
  const {
    conversations,
    activeId,
    activeConversation,
    unreadTotal,
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

  const handleAccept = (id: string) => {
    acceptRequest(id)
    // Accepting opens the new thread; land back on the list afterwards.
    setView('list')
  }

  // The full chat page already owns this experience — don't double up.
  if (pathname.startsWith('/chat')) return null

  if (!isOpen) {
    return (
      <button
        type="button"
        aria-label="Open messages"
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 md:flex"
      >
        <MessageSquareText className="h-6 w-6" />
        {unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
            {unreadTotal}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed right-6 bottom-6 z-40 hidden h-[min(70vh,600px)] w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:flex">
      {/* Window controls — the panes below carry their own titles, so this
          strip only owns the minimize affordance. */}
      <div className="flex flex-shrink-0 items-center justify-end border-b border-slate-100 bg-white px-2 py-1.5">
        <button
          type="button"
          aria-label="Minimize messages"
          onClick={() => setIsOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Minus className="h-5 w-5" />
        </button>
      </div>

      {activeConversation ? (
        <ChatThread
          conversation={activeConversation}
          onBack={closeConversation}
          onSend={sendMessage}
          alwaysShowBack
          className="min-h-0 flex-1"
        />
      ) : view === 'requests' ? (
        <MessageRequestList
          requests={requests}
          onAccept={handleAccept}
          onDecline={declineRequest}
          onBack={() => setView('list')}
          alwaysShowBack
          className="min-h-0 flex-1"
        />
      ) : (
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={openConversation}
          query={query}
          onQueryChange={setQuery}
          requestCount={requestCount}
          onOpenRequests={() => setView('requests')}
          className="min-h-0 flex-1"
        />
      )}
    </div>
  )
}
