import { TMinimalUser } from '../common/common.type'

export type TUser = Pick<TMinimalUser, 'id' | 'name'> & {
  email?: string
  image?: string
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
