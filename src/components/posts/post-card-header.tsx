import { Post } from '@/api/posts/posts.types'
import { TUser } from '@/api/users/users.type'
import { formatPostDate } from '@/libs/utils'
import { AvatarUser } from '../ui/avatar'

export const PostHeader = ({ post, user }: { post: Post; user: TUser }) => {
  return (
    <div className="flex items-center gap-3 pb-2">
      <AvatarUser
        src={user.image}
        name={user.name}
        size={40}
        className="shadow-sm"
      />

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {user.name || 'Unknown User'}
          </span>

          <span className="text-xs text-gray-500">
            {formatPostDate(post?.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
