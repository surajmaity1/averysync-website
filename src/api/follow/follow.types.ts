/**
 * DTOs for the follow graph — mirrors the backend contract in
 * `averysync-backend-internal/docs/04-follow-and-profile-privacy.md`.
 */

export type TFollowStatus = 'PENDING' | 'ACCEPTED'

export type TRelationshipStatus = 'NONE' | 'PENDING' | 'FOLLOWING' | 'SELF'

/** The viewer's relationship to a profile, embedded in `GET /v1/users/{id}`. */
export type TRelationship = {
  status: TRelationshipStatus
  followsYou: boolean
}

/** One directed follow edge, returned by follow / accept mutations. */
export type TFollowEdge = {
  id: string
  followerId: string
  followeeId: string
  status: TFollowStatus
  requestedAt: string
  respondedAt: string | null
  createdAt: string
}

/** A user summary row in follower / following / request lists. */
export type TFollowUser = {
  id: string
  name: string
  image?: string | null
  followedAt?: string | null
}

/** Paginated list envelope shared by followers, following, and the inbox. */
export type TFollowList = {
  data: TFollowUser[]
  total: number
  limit: number
  offset: number
}

export type FollowTargetDTO = {
  userId: string
}

export type FollowerTargetDTO = {
  followerId: string
}

export type TPaginationParams = {
  limit?: number
  offset?: number
}

export type ListFollowUsersDTO = FollowTargetDTO & TPaginationParams
