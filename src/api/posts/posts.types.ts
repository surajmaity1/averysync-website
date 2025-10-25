import { POST_TYPE_ENUM } from './posts.enum'

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
}

export type CreatePostRequestDTO = {
  title: string
  description?: string
  type?: POST_TYPE_ENUM
  isRecorded?: boolean
}
