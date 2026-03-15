import { cn } from '@/libs/utils'
import { Shimmer } from '../common/shimmer'

export const CardSkeleton = ({ className = '' }: { className?: string }) => {
  return (
    <article
      className={cn(
        'mx-auto mb-6 max-w-md overflow-hidden rounded-lg bg-white shadow-lg',
        className,
      )}
    >
      {/* Badge placeholder */}
      <div className="px-4 pt-4 pb-2">
        <Shimmer className="h-5 w-24 rounded-full bg-gray-300" />
      </div>

      {/* Content placeholder */}
      <div className="space-y-3 px-4 pb-4">
        <Shimmer className="h-6 w-3/4 bg-gray-300" /> {/* Title */}
        <Shimmer className="h-4 w-full bg-gray-300" />{' '}
        {/* Description line 1 */}
        <Shimmer className="h-4 w-5/6 bg-gray-300" /> {/* Description line 2 */}
      </div>

      {/* Footer buttons placeholder */}
      <div className="flex justify-between border-t border-gray-200 px-4 py-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Shimmer className="h-5 w-5 rounded-full bg-gray-300" />
            <Shimmer className="h-4 w-10 bg-gray-300" />
          </div>
        ))}
      </div>
    </article>
  )
}
