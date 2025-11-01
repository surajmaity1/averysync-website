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
