import { TRelationship } from '../follow/follow.types'
import { TMinimalUser } from '../common/common.type'

export type TUser = Pick<TMinimalUser, 'id' | 'name'> & {
  email?: string
  image?: string
}

/**
 * Extended profile from `GET /v1/users/{userId}`. The follow-graph fields are
 * optional because lightweight consumers (post cards, rosters) predate them
 * and their fixtures/mocks may omit them; the profile page renders the follow
 * UI only when `relationship` is present.
 */
export type TUserProfile = TUser & {
  isPrivate?: boolean
  followerCount?: number
  followingCount?: number
  relationship?: TRelationship | null
}

export type UpdateProfileRequestDTO = {
  isPrivate: boolean
}

export type TUserSearchParams = {
  search?: string
  profile?: boolean
}

export type TUsersSearchResponse = {
  users: TUser[]
  limit: number
  page: number
  total_count: number
}

export type GetUserByIdRequestDTO = {
  userId: string
}
