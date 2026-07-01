import { cn } from '@/libs/utils'
import { FEED_TABS, FeedTabKey } from '../feed.utils'

type FeedFilterTabsProps = {
  active: FeedTabKey
  onChange: (tab: FeedTabKey) => void
}

export const FeedFilterTabs = ({ active, onChange }: FeedFilterTabsProps) => {
  return (
    <div
      role="tablist"
      aria-label="Filter feed"
      className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1.5 shadow-sm"
    >
      {FEED_TABS.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
              isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                : 'text-slate-500 hover:text-slate-900',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
