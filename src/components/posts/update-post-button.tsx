import { PostsApi } from '@/api/posts/posts.api'
import { Post } from '@/api/posts/posts.types'
import { getDefaultPostFormData, getUpdatePostDetails } from '@/libs/post-utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { PostDialog } from './create-update-post-dialog'
import { TPostFormData } from './create-update-post-form'

type UpdatePostButtonProps = {
  post: Post
}

export const UpdatePostButton = ({ post }: UpdatePostButtonProps) => {
  const queryClient = useQueryClient()
  const [showUpdatePostForm, setShowUpdatePostForm] = useState(false)

  const updatePostMutation = useMutation({
    mutationFn: PostsApi.updatePostById.fn,
    onSuccess: () => {
      toast.success('Post updated successfully')
      void queryClient.invalidateQueries({
        queryKey: PostsApi.getPostById.key({ postId: post.id }),
      })
      void queryClient.invalidateQueries({ queryKey: PostsApi.getPosts.key })
      setShowUpdatePostForm(false)
    },
    onError: () => {
      toast.error('Unable to update post')
    },
  })

  const handleSubmit = (data: TPostFormData) => {
    const updatePostDetails = getUpdatePostDetails(data, post)

    if (Object.keys(updatePostDetails).length > 0) {
      updatePostMutation.mutate({
        postId: post.id,
        ...updatePostDetails,
      })
    }
  }

  return (
    <PostDialog
      mode="update"
      open={showUpdatePostForm}
      onOpenChange={setShowUpdatePostForm}
      defaultData={getDefaultPostFormData(post)}
      isMutationPending={updatePostMutation.isPending}
      onSubmit={(data) => handleSubmit(data)}
    >
      Edit
    </PostDialog>
  )
}
