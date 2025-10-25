import { CreatePostButton } from '@/components/posts/create-post-button'
import { useSearch } from '@tanstack/react-router'

export const Feed = () => {
  const search = useSearch({ from: '/_internal/feed' })

  return (
    <div>
      <div>Feed Page</div>
      <div>
        <CreatePostButton />
      </div>
    </div>
  )
}
