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
