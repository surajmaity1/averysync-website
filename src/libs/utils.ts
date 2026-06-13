import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...input: ClassValue[]) {
  return twMerge(clsx(input))
}

export const formatPostDate = (dateString?: string): string => {
  if (!dateString) return 'Just now'

  const date = new Date(dateString)
  const now = new Date()

  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'

  if (diffMin < 60) return `${diffMin} min ago`

  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`

  if (diffDay <= 6) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    })
  }

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  })
}
