import { useEffect, useMemo, useRef, useState } from 'react'
import { AI_REPLY_DELAY_MS, SAMPLE_AI_CONVERSATIONS } from './ai-chat.constants'
import type { AiConversation } from './ai-chat.types'
import {
  appendAiMessage,
  buildAssistantReply,
  createConversation,
  sortConversationsByRecent,
} from './ai-chat.utils'

/**
 * State for the `/ai/chat` page: the conversation list, the active thread,
 * the sidebar search query, and the simulated assistant round-trip.
 *
 * There is no AI backend yet — the REST contract lives in `src/api/ai/` and
 * this hook is the seam where its queries/mutations will plug in. Until then,
 * sending a prompt appends locally and a canned reply lands after a short
 * delay (see `ai-chat.constants.ts`). A pending reply always lands in the
 * conversation it was asked in, even if the user navigates away meanwhile.
 */
export type AiChatState = {
  /** Conversations ordered by most-recent activity, newest first. */
  conversations: AiConversation[]
  activeId: string | null
  activeConversation: AiConversation | null
  /** Conversation ids currently awaiting an assistant reply. */
  thinkingIds: string[]
  /** Whether the active conversation is awaiting a reply — gates the composer. */
  isThinking: boolean
  query: string
  setQuery: (value: string) => void
  /** Return to the empty "new chat" hero. Pending replies keep flowing. */
  startNewChat: () => void
  openConversation: (id: string) => void
  /**
   * Send a prompt: creates + opens a conversation when none is active,
   * otherwise appends to the active one. Blank text, or a send while the
   * active thread is already awaiting a reply, is a no-op.
   */
  sendMessage: (text: string) => void
  /** Rename a conversation (trimmed; blank is a no-op). */
  renameConversation: (id: string, title: string) => void
  /** Delete a conversation; deleting the active one returns to a new chat. */
  deleteConversation: (id: string) => void
}

export const useAiChatState = (
  initialConversations: AiConversation[] = SAMPLE_AI_CONVERSATIONS,
  replyDelayMs: number = AI_REPLY_DELAY_MS,
): AiChatState => {
  const [conversations, setConversations] = useState<AiConversation[]>(
    () => initialConversations,
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  const [thinkingIds, setThinkingIds] = useState<string[]>([])
  const [query, setQuery] = useState('')

  // One pending timer per conversation awaiting a reply.
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const ordered = useMemo(
    () => sortConversationsByRecent(conversations),
    [conversations],
  )
  const activeConversation = ordered.find((c) => c.id === activeId) ?? null

  const scheduleReply = (conversationId: string, prompt: string) => {
    setThinkingIds((prev) => [...prev, conversationId])
    const timer = setTimeout(() => {
      timersRef.current.delete(conversationId)
      setThinkingIds((prev) => prev.filter((id) => id !== conversationId))
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? appendAiMessage(c, 'assistant', buildAssistantReply(prompt))
            : c,
        ),
      )
    }, replyDelayMs)
    timersRef.current.set(conversationId, timer)
  }

  const sendMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    if (activeId === null) {
      const created = createConversation(trimmed)
      setConversations((prev) => [created, ...prev])
      setActiveId(created.id)
      scheduleReply(created.id, trimmed)
      return
    }

    // One in-flight question per thread, like a real assistant turn.
    if (thinkingIds.includes(activeId)) return

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId ? appendAiMessage(c, 'user', trimmed) : c,
      ),
    )
    scheduleReply(activeId, trimmed)
  }

  const renameConversation = (id: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c)),
    )
  }

  const deleteConversation = (id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setThinkingIds((prev) => prev.filter((tid) => tid !== id))
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeId === id) setActiveId(null)
  }

  return {
    conversations: ordered,
    activeId,
    activeConversation,
    thinkingIds,
    isThinking: activeId !== null && thinkingIds.includes(activeId),
    query,
    setQuery,
    startNewChat: () => setActiveId(null),
    openConversation: setActiveId,
    sendMessage,
    renameConversation,
    deleteConversation,
  }
}
