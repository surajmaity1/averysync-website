import { useSearch } from "@tanstack/react-router"

export const Feed = () => {
  const search = useSearch({from: '/_internal/feed'})
  console.log(search)
  return <div>Feed Page</div>
}
