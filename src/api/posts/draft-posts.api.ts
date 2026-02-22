// api/posts/posts.api.ts

import { SpaceStatus, UpdatePostResponse } from './draft-posts.types'

export const PostsApi = {
  // Get post by ID
  getPostById: {
    key: ({ postId }: { postId: string }) => ['posts', postId],
    fn: async ({ postId }: { postId: string }) => {
      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch post')
      return response.json()
    },
  },

  // Get all posts
  getPosts: {
    key: ['posts'],
    fn: async () => {
      const response = await fetch('/api/posts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch posts')
      return response.json()
    },
  },

  // Update post by ID
  updatePostById: {
    fn: async ({
      postId,
      status,
    }: {
      postId: string
      status: SpaceStatus
    }): Promise<UpdatePostResponse> => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update post')
      }

      const data = await response.json()

      // The response should include:
      // - data: Post object
      // - token: JWT token (when status is LIVE)
      // - websocket_url: WebSocket URL (when status is LIVE)
      return {
        data: data.data,
        token: data.token,
        websocket_url: data.websocket_url,
      }
    },
  },

  // Create post
  createPost: {
    fn: async (postData: any) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(postData),
      })
      if (!response.ok) throw new Error('Failed to create post')
      return response.json()
    },
  },

  // Delete post
  deletePost: {
    fn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to delete post')
      return response.json()
    },
  },
}

// Example usage in component:
/*
const mutation = useMutation({
  mutationFn: PostsApi.updatePostById.fn,
  onSuccess: (response) => {
    console.log('Post updated:', response.data)
    if (response.token && response.websocket_url) {
      // Connect to WebRTC
      startSpace(response.token, response.websocket_url)
    }
  },
})

// Call it
mutation.mutate({ postId: '123', status: SpaceStatus.live })
*/
