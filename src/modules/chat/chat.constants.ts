import type { ChatConversation } from './chat.types'

/**
 * Presentational sample conversations for the chat page.
 *
 * The product API today exposes only posts and users — there is no messaging
 * endpoint yet. Rather than fabricate API calls, the chat UI renders from this
 * clearly-labelled static module (mirroring the feed's `feed.constants.ts`).
 * Sending a message updates local component state only; nothing is persisted.
 *
 * ⚠️ Replace with real queries/mutations once a messaging endpoint ships.
 * Nothing here is user-specific or stored.
 */
export const SAMPLE_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conversation-maya',
    participant: {
      id: 'user-maya',
      name: 'Maya Patel',
      role: 'Systems Engineer',
    },
    online: true,
    unreadCount: 2,
    messages: [
      {
        id: 'conversation-maya-m1',
        senderId: 'user-maya',
        text: 'Did you get a chance to look at the SFU reconnect PR?',
        sentAt: '2026-07-13T08:12:00.000Z',
      },
      {
        id: 'conversation-maya-m2',
        senderId: 'me',
        text: 'Yeah! Left a couple of comments on the backoff logic.',
        sentAt: '2026-07-13T08:20:00.000Z',
      },
      {
        id: 'conversation-maya-m3',
        senderId: 'user-maya',
        text: 'Perfect, addressing them now. The late-joiner fix is in too.',
        sentAt: '2026-07-13T08:41:00.000Z',
      },
      {
        id: 'conversation-maya-m4',
        senderId: 'user-maya',
        text: 'Want to hop on a quick Space to walk through it?',
        sentAt: '2026-07-13T08:42:00.000Z',
      },
    ],
  },
  {
    id: 'conversation-diego',
    participant: {
      id: 'user-diego',
      name: 'Diego Santos',
      role: 'Developer Advocate',
    },
    online: true,
    unreadCount: 0,
    messages: [
      {
        id: 'conversation-diego-m1',
        senderId: 'me',
        text: 'The mobile layout for the feed is shipping today 🎉',
        sentAt: '2026-07-13T06:05:00.000Z',
      },
      {
        id: 'conversation-diego-m2',
        senderId: 'user-diego',
        text: 'Amazing. I will draft the release note for the community.',
        sentAt: '2026-07-13T06:30:00.000Z',
      },
    ],
  },
  {
    id: 'conversation-priya',
    participant: {
      id: 'user-priya',
      name: 'Priya Sharma',
      role: 'Design Engineer',
    },
    online: false,
    unreadCount: 1,
    messages: [
      {
        id: 'conversation-priya-m1',
        senderId: 'user-priya',
        text: 'Sent over the updated profile hero spacing tokens.',
        sentAt: '2026-07-12T17:15:00.000Z',
      },
      {
        id: 'conversation-priya-m2',
        senderId: 'me',
        text: 'Thanks Priya, wiring them in now.',
        sentAt: '2026-07-12T18:02:00.000Z',
      },
      {
        id: 'conversation-priya-m3',
        senderId: 'user-priya',
        text: 'Let me know if the breakpoints feel off on small phones.',
        sentAt: '2026-07-12T18:20:00.000Z',
      },
    ],
  },
  {
    id: 'conversation-leo',
    participant: {
      id: 'user-leo',
      name: 'Leo Nakamura',
      role: 'Staff Engineer',
    },
    online: false,
    unreadCount: 0,
    messages: [
      {
        id: 'conversation-leo-m1',
        senderId: 'user-leo',
        text: 'Reviewed the wake-lock resilience doc — solid work.',
        sentAt: '2026-07-11T13:40:00.000Z',
      },
    ],
  },
]

/**
 * Presentational sample message requests — people the current user has not
 * connected with yet who want to start a conversation (the Instagram/Luma
 * "message requests" inbox). Accepting one promotes it into a normal
 * conversation; declining drops it. Same static-sample caveats as
 * `SAMPLE_CONVERSATIONS` above — replace with real queries once a messaging
 * endpoint ships.
 */
export const SAMPLE_MESSAGE_REQUESTS: ChatConversation[] = [
  {
    id: 'request-aisha',
    participant: {
      id: 'user-aisha',
      name: 'Aisha Khan',
      role: 'Product Designer',
    },
    online: true,
    unreadCount: 1,
    messages: [
      {
        id: 'request-aisha-m1',
        senderId: 'user-aisha',
        text: 'Hi! Loved your talk on realtime audio — can I ask a few questions?',
        sentAt: '2026-07-13T10:05:00.000Z',
      },
    ],
  },
  {
    id: 'request-tomas',
    participant: {
      id: 'user-tomas',
      name: 'Tomás Rivera',
      role: 'Community Member',
    },
    online: false,
    unreadCount: 1,
    messages: [
      {
        id: 'request-tomas-m1',
        senderId: 'user-tomas',
        text: 'Would love to collaborate on a Space about accessibility.',
        sentAt: '2026-07-12T15:22:00.000Z',
      },
    ],
  },
]
