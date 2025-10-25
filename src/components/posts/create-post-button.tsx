import { PostsApi } from '@/api/posts/posts.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { CreatedUpdatePostDialog } from './create-update-post-dialog'
import { TPostFormData } from './create-update-post-form'

type CreatePostButtonProps = {
  defaultData?: Partial<TPostFormData>
}

export const CreatePostButton = ({ defaultData }: CreatePostButtonProps) => {
  const queryClient = useQueryClient()
  const [showCreatePostForm, setShowCreatePostForm] = useState(false)
  const createPostMutation = useMutation({
    mutationFn: PostsApi.createPost.fn,
    onSuccess: (response) => {
      toast.success('Post created')
      setShowCreatePostForm(false)
    },
    onError: () => {
      toast.error('Unable to create post')
    },
  })

  return (
    <CreatedUpdatePostDialog
      open={showCreatePostForm}
      isMutationPending={createPostMutation.isPending}
      onSubmit={(data) => {
        createPostMutation.mutate({
          title: data.title,
          description: data.description,
          type: data.type,
          isRecorded: data.isRecorded,
        })
      }}
      onOpenChange={setShowCreatePostForm}
      mode="create"
      defaultData={defaultData}
    >
      <Button>Create Post / Space</Button>
    </CreatedUpdatePostDialog>
  )
}
