import { cn } from '@/libs/utils'

export function Shimmer({ className }: { className: string }) {
  return (
    <div
      data-testid="shimmer"
      className={cn('animate-pulse rounded-2xl bg-gray-300', className)}
    ></div>
  )
}
