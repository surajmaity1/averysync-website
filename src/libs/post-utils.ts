import { Post, UpdatePostRequestDTO } from '@/api/posts/posts.types'
import { TPostFormData } from '@/components/posts/create-update-post-form'

export const getDefaultPostFormData = (post: Post): Partial<TPostFormData> => {
  return {
    postId: post.id,
    title: post.title,
    description: post.description,
    isRecorded: post.isRecorded,
  }
}

export const getUpdatePostDetails = (
  postFormData: TPostFormData,
  initialPost: Post,
): Partial<Omit<UpdatePostRequestDTO, 'id'>> => {
  const updatePostDetails: Partial<Omit<UpdatePostRequestDTO, 'id'>> = {}

  if (postFormData.title !== initialPost.title) {
    updatePostDetails.title = postFormData.title
  }

  if (postFormData.description !== initialPost.description) {
    updatePostDetails.description = postFormData.description
  }

  if (postFormData.isRecorded !== initialPost.isRecorded) {
    updatePostDetails.isRecorded = postFormData.isRecorded
  }

  return updatePostDetails
}
