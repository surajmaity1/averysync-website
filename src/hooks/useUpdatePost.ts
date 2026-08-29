import { PostsApi } from "@/api/posts/posts.api"
import { Post } from "@/api/posts/posts.types"
import { TPostFormData } from "@/components/posts/create-update-post-form"
import { getUpdatePostDetails } from "@/libs/post-utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type UseUpdateTaskOptions = {
    post: Post
    postId?: string
}

export const useUpdatePost = ({post, postId}: UseUpdateTaskOptions) => {
    const queryClient = useQueryClient()

    const updatePostMutation = useMutation({
        mutationFn: PostsApi.updatePostById.fn,
        onSuccess: () => {
            toast.success('Post updated successfully')
            void queryClient.invalidateQueries({
                queryKey: PostsApi.getPostById.key({ postId: post.id }),
            })
            void queryClient.invalidateQueries({ queryKey: PostsApi.getPosts.key })
        },
        onError: () => {
            toast.error('Unable to update post')
        },
    })

    const handleUpdatePostSubmission = (postDetails: TPostFormData, customOnSuccess?: () => void) => {
        const updatePostDetails = getUpdatePostDetails(postDetails, post)

        if (Object.keys(updatePostDetails).length > 0) {
            updatePostMutation.mutate(
                {
                    postId: post.id,
                    ...updatePostDetails
                },
                {
                    onSuccess: () => {
                        customOnSuccess?.()
                    }
                }
            )
        }
    }

    return {
        updatePostMutation,
        handleUpdatePostSubmission,
    }
}