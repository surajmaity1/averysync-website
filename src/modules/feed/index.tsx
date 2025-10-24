import { useSearch } from '@tanstack/react-router'

export const Feed = () => {
  const search = useSearch({ from: '/_internal/feed' })

  return <div>Feed Page</div>
}
