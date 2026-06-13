import * as Avatar from '@radix-ui/react-avatar'

interface AvatarUserProps {
  src?: string
  name?: string
  size?: number
  className?: string
}

export const AvatarUser = ({
  src,
  name = 'User',
  size = 32,
  className = '',
}: AvatarUserProps) => {
  return (
    <Avatar.Root
      style={{ width: size, height: size }}
      className={`flex items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-100 ${className} `}
    >
      <Avatar.Image
        src={src}
        alt={name}
        className="h-full w-full object-cover"
      />

      <Avatar.Fallback
        className="text-xs font-semibold text-gray-600"
        delayMs={400}
      >
        {name?.charAt(0)?.toUpperCase() || 'U'}
      </Avatar.Fallback>
    </Avatar.Root>
  )
}
