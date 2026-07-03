import { cn } from '@/libs/utils'
import React from 'react'

type BrandMarkSize = 'sm' | 'md'

interface BrandMarkProps {
  size?: BrandMarkSize
  className?: string
}

interface BarSpec {
  height: string
  duration: string
  delay: string
  muted?: boolean
}

const BARS: Record<BrandMarkSize, BarSpec[]> = {
  md: [
    { height: '60%', duration: '1s', delay: '0s' },
    { height: '100%', duration: '.8s', delay: '.15s' },
    { height: '45%', duration: '1.1s', delay: '.3s', muted: true },
    { height: '80%', duration: '.9s', delay: '.05s' },
  ],
  sm: [
    { height: '60%', duration: '1s', delay: '0s' },
    { height: '100%', duration: '.8s', delay: '.2s' },
    { height: '50%', duration: '1.1s', delay: '.35s' },
  ],
}

const BOX_CLASSES: Record<BrandMarkSize, string> = {
  md: 'h-9 w-9 rounded-xl',
  sm: 'h-7 w-7 rounded-lg',
}

const BAR_WRAP_CLASSES: Record<BrandMarkSize, string> = {
  md: 'h-4 gap-[3px]',
  sm: 'h-3 gap-[2px]',
}

const BAR_WIDTH: Record<BrandMarkSize, string> = {
  md: 'w-[3px]',
  sm: 'w-[2px]',
}

/** Averysync logo: a blue tile with animated equalizer bars. */
export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 'md',
  className,
}) => (
  <span
    className={cn(
      'relative flex items-center justify-center bg-blue-600',
      BOX_CLASSES[size],
      className,
    )}
  >
    <span className={cn('flex items-end', BAR_WRAP_CLASSES[size])}>
      {BARS[size].map((bar, i) => (
        <i
          key={i}
          className={cn(
            'eq-bar block rounded-full',
            BAR_WIDTH[size],
            bar.muted ? 'bg-white/80' : 'bg-white',
          )}
          style={
            {
              height: bar.height,
              '--dur': bar.duration,
              '--dl': bar.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  </span>
)
