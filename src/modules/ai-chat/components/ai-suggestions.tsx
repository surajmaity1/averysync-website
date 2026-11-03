import { cn } from '@/libs/utils'
import {
  GraduationCap,
  Lightbulb,
  PenLine,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import React from 'react'

type AiSuggestionsProps = {
  suggestions: string[]
  onPick: (prompt: string) => void
  className?: string
}

// Decorative icons cycled across the cards to give each prompt a visual
// anchor. Purely presentational (aria-hidden) so the accessible name stays the
// prompt text alone.
const SUGGESTION_ICONS: LucideIcon[] = [
  PenLine,
  Sparkles,
  Lightbulb,
  GraduationCap,
]

/**
 * Prompt starters under the empty-state composer. Laid out as an even,
 * responsive grid of icon cards (one column on phones, two from `sm` up) so it
 * stays tidy at every width instead of ragged, wrapping pills. Memoized because
 * the source list is static — it never needs to re-render as chat state
 * changes.
 */
export const AiSuggestions = React.memo(function AiSuggestions({
  suggestions,
  onPick,
  className,
}: AiSuggestionsProps) {
  if (suggestions.length === 0) return null

  return (
    <section
      aria-label="Suggested prompts"
      className={cn('grid grid-cols-1 gap-2.5 sm:grid-cols-2', className)}
    >
      {suggestions.map((prompt, index) => {
        const Icon = SUGGESTION_ICONS[index % SUGGESTION_ICONS.length]
        return (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className={cn(
              'group flex h-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-left',
              'transition-colors hover:border-blue-200 hover:bg-blue-50/60',
              'focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none',
            )}
          >
            <span
              aria-hidden
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600"
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 text-sm leading-snug text-slate-700 transition-colors group-hover:text-blue-700">
              {prompt}
            </span>
          </button>
        )
      })}
    </section>
  )
})
