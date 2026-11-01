import { POST_TYPE_ENUM } from './posts.enum'

export type Post = {
  id: string
  title: string
  description?: string
  type: POST_TYPE_ENUM
  isRecorded?: boolean
  isDeleted?: boolean
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
  status?: number
}

export type TPostCreatedBy = {
  id: string
  name: string
}

export type TPost = {
  id: string
  title: string
  description?: string
  type?: POST_TYPE_ENUM
  is_recorded?: boolean
  created_by: TPostCreatedBy
  scheduled_started_at?: string
  scheduled_ended_at?: string
  started_at?: string
  ended_at?: string
  created_in_timezone?: string
  status?: string
}

export type CreatePostRequestDTO = {
  title: string
  description?: string
  type?: POST_TYPE_ENUM
  isRecorded?: boolean
}

export type GetPostsDTO = {
  links: {
    prev?: string
    next?: string
  }
  errors?: Record<string, any>
  posts: Post[]
}

export type GetPostByIdRequestDTO = {
  postId: string
}

export type DeletePostByIdRequestDTO = {
  postId: string
}

export type PostDTO = {
  data: Post
  token: string
}

export type Reminder = {
  id: string
  isReminderSet: boolean
  spaceId: string
  isDeleted?: boolean
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export type ReminderDTO = {
  id: string
  isReminderSet: boolean
  spaceId: string
  isDeleted?: boolean
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export type GetSpaceReminderByIdRequestDTO = {
  postId: string
}

export type CreateUpdateSpaceReminderRequestDTO = {
  postId: string
  isReminderSet: boolean
}

// --- Space participants & moderation (see docs/03-space-participants-integration-guide.md) ---

// COHOST/SPEAKER are reserved by the backend but not issued yet, so the wire
// only ever carries these two today.
export type ParticipantRole = 'HOST' | 'LISTENER'

/**
 * The participant shape returned by every participants endpoint. `isMuted` /
 * `mutedUntil` are the EFFECTIVE values — the backend lazily evaluates expiry,
 * so the UI must never recompute them. `leftAt === null` means the participant
 * is currently in the space.
 */
export type ParticipantDTO = {
  id: string
  spaceId: string
  userId: string
  role: ParticipantRole
  isMuted: boolean
  mutedUntil: string | null
  firstJoinedAt: string
  lastJoinedAt: string
  leftAt: string | null
}

// token can be null (e.g. misconfiguration); callers must guard before use.
export type JoinSpaceResponse = { data: ParticipantDTO; token: string | null }
export type GetParticipantsResponse = { data: ParticipantDTO[] }

export type JoinSpaceRequestDTO = { spaceId: string }
export type ListParticipantsRequestDTO = {
  spaceId: string
  includeLeft?: boolean
}
export type LeaveOrRemoveRequestDTO = { spaceId: string; userId: string }
export type MuteParticipantRequestDTO = {
  spaceId: string
  userId: string
  isMuted: boolean
  durationSeconds?: number // only valid when isMuted === true, 1..86400
  reason?: string // only valid when isMuted === true, ≤300 chars
}

export type UpdatePostRequestDTO = {
  postId: string
  title?: string
  description?: string
  isRecorded?: boolean
  scheduledStartedAt?: string
  scheduledEndedAt?: string
  startedAt?: string
  endedAt?: string
  createdInTimezone?: string
  status?: string
  type?: string
}
