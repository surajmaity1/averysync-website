import { cn } from '@/libs/utils'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

type FeedRailCardProps = {
  title: string
  icon: LucideIcon
  action?: string
  onAction?: () => void
  children: ReactNode
  className?: string
}

/** Shared card shell for the left/right rail sections. */
export const FeedRailCard = ({
  title,
  icon: Icon,
  action,
  onAction,
  children,
  className = '',
}: FeedRailCardProps) => {
  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900">
          <Icon className="h-4 w-4 text-blue-600" strokeWidth={2.2} />
          {title}
        </span>
        {action && (
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
          >
            {action}
          </button>
        )}
      </header>
      <div className="px-4 pb-4">{children}</div>
    </section>
  )
}
