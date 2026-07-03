import { cn } from '@/libs/utils'
import React from 'react'

type PingColor = 'rose' | 'emerald'

interface PingDotProps {
  color?: PingColor
  /** Size classes for the dot, e.g. "h-2 w-2". */
  className?: string
}

const COLOR_CLASSES: Record<PingColor, { ping: string; dot: string }> = {
  rose: { ping: 'bg-rose-400', dot: 'bg-rose-500' },
  emerald: { ping: 'bg-emerald-400', dot: 'bg-emerald-500' },
}

/** Small pulsing status dot used for LIVE badges and activity markers. */
export const PingDot: React.FC<PingDotProps> = ({
  color = 'rose',
  className = 'h-2 w-2',
}) => {
  const colors = COLOR_CLASSES[color]
  return (
    <span className={cn('relative flex', className)}>
      <span
        className={cn(
          'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
          colors.ping,
        )}
      />
      <span
        className={cn(
          'relative inline-flex rounded-full',
          colors.dot,
          className,
        )}
      />
    </span>
  )
}
