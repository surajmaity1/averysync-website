import type { AiConversation } from './ai-chat.types'

/**
 * Presentational sample conversations for the AI assistant page.
 *
 * The product API today has no `/v1/ai` endpoints — the REST contract they
 * will follow is defined (and unit-tested) in `src/api/ai/ai.api.ts`. Until
 * that backend ships, the page renders from this clearly-labelled static
 * module (mirroring `chat.constants.ts`): sending a prompt updates local
 * state only and the assistant answers with a canned preview reply.
 *
 * ⚠️ Replace with `AiApi` queries/mutations once the endpoints ship.
 * Nothing here is user-specific or stored.
 */

const daysAgoIso = (days: number, hours = 0): string => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(d.getHours() - hours)
  return d.toISOString()
}

const sampleConversation = (
  id: string,
  title: string,
  prompt: string,
  reply: string,
  updatedAt: string,
): AiConversation => ({
  id,
  title,
  createdAt: updatedAt,
  updatedAt,
  messages: [
    { id: `${id}-m1`, role: 'user', text: prompt, sentAt: updatedAt },
    { id: `${id}-m2`, role: 'assistant', text: reply, sentAt: updatedAt },
  ],
})

export const SAMPLE_AI_CONVERSATIONS: AiConversation[] = [
  sampleConversation(
    'ai-sample-space-topics',
    'Space topic ideas for this week',
    'Give me five audio space topic ideas for an engineering community.',
    'Here are five: 1) Post-mortem war stories, 2) WebRTC in production, 3) Career AMAs, 4) Live code review, 5) Side-project show-and-tell.',
    daysAgoIso(0, 2),
  ),
  sampleConversation(
    'ai-sample-launch-post',
    'Draft a launch post',
    'Help me draft a short launch post for our new profile pages.',
    'Draft: “Profile pages are live! Showcase your spaces, posts, and the communities you host — all in one place. Take a look and make it yours.”',
    daysAgoIso(1, 3),
  ),
  sampleConversation(
    'ai-sample-sfu-explainer',
    'Explain SFU vs mesh simply',
    'Explain the difference between an SFU and mesh WebRTC topology simply.',
    'Mesh: every participant sends audio to every other participant — cheap to build, but bandwidth explodes with group size. SFU: everyone sends one stream to a server that forwards it — scales to large rooms.',
    daysAgoIso(4, 1),
  ),
]

/** Prompt starters shown as chips under the empty-state composer. */
export const AI_PROMPT_SUGGESTIONS: string[] = [
  'Draft a post announcing my next audio space',
  'Summarize what makes a great space host',
  'Brainstorm topics for a weekly community space',
  'Explain WebRTC like I am new to it',
]

/** Display name of the assistant, shown in the composer and thread. */
export const AI_ASSISTANT_NAME = 'AverySync Assistant'

/** Simulated latency before the canned assistant reply lands. */
export const AI_REPLY_DELAY_MS = 600
