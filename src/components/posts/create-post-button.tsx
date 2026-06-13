import { PostsApi } from '@/api/posts/posts.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { PostDialog } from './create-update-post-dialog'
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
      void queryClient.invalidateQueries({ queryKey: PostsApi.getPosts.key })
      toast.success('Post created')
      setShowCreatePostForm(false)
    },
    onError: () => {
      toast.error('Unable to create post')
    },
  })

  return (
    <PostDialog
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
      <Button className="fixed right-6 bottom-12 flex h-14 w-14 transform items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg transition hover:scale-110 hover:bg-blue-700">
        +
      </Button>
    </PostDialog>
  )
}
