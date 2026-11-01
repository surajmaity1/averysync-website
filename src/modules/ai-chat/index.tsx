import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/libs/utils'
import { PanelLeft, SquarePen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AI_ASSISTANT_NAME, AI_PROMPT_SUGGESTIONS } from './ai-chat.constants'
import { greetingForHour } from './ai-chat.utils'
import { AiComposer } from './components/ai-composer'
import { AiSidebar } from './components/ai-sidebar'
import { AiThread } from './components/ai-thread'
import { useAiChatState } from './use-ai-chat-state'

/**
 * The `/ai/chat` page: a Claude-style assistant surface — chat-history
 * sidebar on the left, and either the new-chat hero (greeting + composer +
 * prompt suggestions) or the open thread on the right.
 */
export const AiChat = () => {
  const { user } = useAuth()
  const {
    conversations,
    activeId,
    activeConversation,
    isThinking,
    query,
    setQuery,
    startNewChat,
    openConversation,
    sendMessage,
    renameConversation,
    deleteConversation,
  } = useAiChatState()

  // Sidebar visibility: collapsible on desktop, an overlay drawer on mobile.
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  // Bump a key alongside the text so tapping the same chip twice still reseeds.
  const [seed, setSeed] = useState<{ text: string; key: number }>()

  // Escape dismisses the mobile drawer, mirroring modal conventions.
  useEffect(() => {
    if (!mobileSidebarOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileSidebarOpen])

  const firstName = user.name?.trim().split(/\s+/)[0]
  const greeting = `${greetingForHour(new Date().getHours())}${firstName ? `, ${firstName}` : ''}`

  const handleSelect = (id: string) => {
    openConversation(id)
    setMobileSidebarOpen(false)
  }

  const handleNewChat = () => {
    startNewChat()
    setMobileSidebarOpen(false)
  }

  const sidebarProps = {
    conversations,
    activeId,
    query,
    onQueryChange: setQuery,
    onSelect: handleSelect,
    onNewChat: handleNewChat,
    onRename: renameConversation,
    onDelete: deleteConversation,
    user,
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-slate-50">
      {/* Desktop sidebar (collapsible) */}
      {sidebarOpen && (
        <AiSidebar
          {...sidebarProps}
          onClose={() => setSidebarOpen(false)}
          className="hidden md:flex"
        />
      )}

      {/* Mobile drawer — above the app's bottom navbar (z-50). */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Dismiss sidebar"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <AiSidebar
            {...sidebarProps}
            onClose={() => setMobileSidebarOpen(false)}
            className="shadow-panel relative z-10"
          />
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col bg-white">
        {/* Top bar */}
        <header className="flex flex-shrink-0 items-center gap-1 border-b border-slate-100 px-3 py-2.5">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:flex"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          )}
          <p className="min-w-0 flex-1 truncate px-2 text-sm font-semibold text-slate-900">
            {activeConversation?.title ?? AI_ASSISTANT_NAME}
          </p>
          <button
            type="button"
            onClick={handleNewChat}
            aria-label="Start new chat"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <SquarePen className="h-[18px] w-[18px]" />
          </button>
        </header>

        {activeConversation ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AiThread
                conversation={activeConversation}
                isThinking={isThinking}
                className="mx-auto w-full max-w-3xl px-4 py-6"
              />
            </div>
            <div className="flex-shrink-0 px-4 pt-2 pb-14 md:pb-4">
              <AiComposer
                onSend={sendMessage}
                disabled={isThinking}
                autoFocus
                focusKey={activeId}
                className="mx-auto w-full max-w-3xl"
              />
            </div>
          </>
        ) : (
          /* New-chat hero */
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 pb-14 md:pb-4">
            <div className="w-full max-w-3xl">
              <h1 className="tracking-tightest pb-2 text-center text-3xl font-bold text-slate-900 sm:text-4xl">
                {greeting}
              </h1>
              <p className="pb-6 text-center text-sm text-slate-500">
                Ask anything — drafts, summaries, or ideas for your community.
              </p>
              <AiComposer onSend={sendMessage} seed={seed} autoFocus />
              <div className="flex flex-wrap justify-center gap-2 pt-5">
                {AI_PROMPT_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      setSeed((prev) => ({
                        text: suggestion,
                        key: (prev?.key ?? 0) + 1,
                      }))
                    }
                    className={cn(
                      'rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-600 shadow-sm transition-colors',
                      'hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700',
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
