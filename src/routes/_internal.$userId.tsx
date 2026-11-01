import { UserProfile } from '@/modules/profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_internal/$userId')({
  component: UserProfilePage,
})

function UserProfilePage() {
  const { userId } = Route.useParams()

  return <UserProfile userId={userId} />
}
