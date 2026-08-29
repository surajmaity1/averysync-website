import { Post } from '@/api/posts/posts.types'
import { useUpdatePost } from '@/hooks/useUpdatePost'
import { getDefaultPostFormData } from '@/libs/post-utils'
import { Edit2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { PostDialog } from './create-update-post-dialog'
import { TPostFormData } from './create-update-post-form'

type UpdatePostButtonProps = {
  post: Post
  postId?: string
}

export const UpdatePostButton = ({ post, postId }: UpdatePostButtonProps) => {
  const [showUpdatePostForm, setShowUpdatePostForm] = useState(false)

  const { updatePostMutation, handleUpdatePostSubmission } = useUpdatePost({
    post,
    postId,
  })

  const handleSubmit = (data: TPostFormData) => {
    handleUpdatePostSubmission(data, () => {
      setShowUpdatePostForm(false)
    })
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
      <Button
        className="bg-gray-50 hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation()
          setShowUpdatePostForm(true)
        }}
      >
        <Edit2 />
      </Button>
    </PostDialog>
  )
}
