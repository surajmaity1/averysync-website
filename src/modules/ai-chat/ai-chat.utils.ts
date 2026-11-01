import type {
  AiConversation,
  AiConversationGroup,
  AiMessage,
  AiRole,
} from './ai-chat.types'

/** Max sidebar title length before truncation. */
const TITLE_MAX_LENGTH = 40

/** Fallback title when a prompt is blank. */
export const DEFAULT_CONVERSATION_TITLE = 'New chat'

/**
 * Sidebar title derived from the first prompt: whitespace collapsed, trimmed,
 * and truncated to {@link TITLE_MAX_LENGTH} characters with an ellipsis.
 */
export const deriveConversationTitle = (text: string): string => {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return DEFAULT_CONVERSATION_TITLE
  if (cleaned.length <= TITLE_MAX_LENGTH) return cleaned
  return `${cleaned.slice(0, TITLE_MAX_LENGTH - 1).trimEnd()}…`
}

/** Time-of-day greeting for the empty-chat hero, e.g. `Good morning`. */
export const greetingForHour = (hour: number): string => {
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/** New conversation seeded with the first user prompt. */
export const createConversation = (
  text: string,
  now: Date = new Date(),
): AiConversation => {
  const iso = now.toISOString()
  const id = `ai-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    title: deriveConversationTitle(text),
    createdAt: iso,
    updatedAt: iso,
    messages: [
      { id: `${id}-m1`, role: 'user', text: text.trim(), sentAt: iso },
    ],
  }
}

/**
 * Returns a new conversation with `text` appended and `updatedAt` bumped.
 * Blank/whitespace text is a no-op and the original conversation is returned
 * unchanged (referentially equal). The original is never mutated.
 */
export const appendAiMessage = (
  conversation: AiConversation,
  role: AiRole,
  text: string,
  now: Date = new Date(),
): AiConversation => {
  const trimmed = text.trim()
  if (!trimmed) return conversation

  const message: AiMessage = {
    id: `${conversation.id}-m${conversation.messages.length + 1}`,
    role,
    text: trimmed,
    sentAt: now.toISOString(),
  }

  return {
    ...conversation,
    updatedAt: message.sentAt,
    messages: [...conversation.messages, message],
  }
}

/**
 * Conversations ordered by most recent activity, newest first. Never mutates
 * the input (returns a new array).
 */
export const sortConversationsByRecent = (
  conversations: AiConversation[],
): AiConversation[] =>
  [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

/** Local-midnight start of the day `daysAgo` days before `now`. */
const startOfDaysAgo = (now: Date, daysAgo: number): number => {
  const day = new Date(now)
  day.setHours(0, 0, 0, 0)
  day.setDate(day.getDate() - daysAgo)
  return day.getTime()
}

/**
 * Buckets conversations into the sidebar's recency sections, newest bucket
 * first and each bucket ordered newest-first. Empty buckets are omitted.
 */
export const groupConversationsByRecency = (
  conversations: AiConversation[],
  now: Date = new Date(),
): AiConversationGroup[] => {
  const today = startOfDaysAgo(now, 0)
  const yesterday = startOfDaysAgo(now, 1)
  const weekAgo = startOfDaysAgo(now, 7)

  const bucketOf = (
    conversation: AiConversation,
  ): AiConversationGroup['label'] => {
    const at = new Date(conversation.updatedAt).getTime()
    if (at >= today) return 'Today'
    if (at >= yesterday) return 'Yesterday'
    if (at >= weekAgo) return 'Previous 7 days'
    return 'Older'
  }

  const labels: AiConversationGroup['label'][] = [
    'Today',
    'Yesterday',
    'Previous 7 days',
    'Older',
  ]
  const ordered = sortConversationsByRecent(conversations)

  return labels
    .map((label) => ({
      label,
      conversations: ordered.filter((c) => bucketOf(c) === label),
    }))
    .filter((group) => group.conversations.length > 0)
}

/**
 * Case-insensitive title search for the sidebar. A blank query returns the
 * input unchanged.
 */
export const filterConversations = (
  conversations: AiConversation[],
  query: string,
): AiConversation[] => {
  const needle = query.trim().toLowerCase()
  if (!needle) return conversations
  return conversations.filter((c) => c.title.toLowerCase().includes(needle))
}

/**
 * Deterministic canned assistant reply. There is no AI backend yet (see
 * `ai-chat.constants.ts`), so the thread answers with an honest preview
 * response that echoes the prompt. Replace with the `AiApi.createMessage`
 * mutation once the `/v1/ai` endpoints ship.
 */
export const buildAssistantReply = (prompt: string): string => {
  const cleaned = prompt.replace(/\s+/g, ' ').trim()
  return [
    `You asked: “${cleaned}”`,
    '',
    'The AverySync Assistant backend is not connected yet, so this is a preview reply. Here is how I would approach it once live:',
    '• Break the question into the smallest concrete steps.',
    '• Pull in anything relevant from your feed and spaces.',
    '• Draft an answer you can edit and share.',
  ].join('\n')
}
