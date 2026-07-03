import { cn } from '@/libs/utils'
import React, { useMemo } from 'react'

interface WaveformProps {
  /** Number of equalizer bars to render. */
  bars: number
  className?: string
}

interface BarSpec {
  height: number
  opacity: number
  accent: boolean
  duration: string
  delay: string
}

const buildBars = (count: number): BarSpec[] =>
  Array.from({ length: count }, (_, i) => {
    // Sine envelope gives a natural shape even when animation is paused
    const height = 28 + Math.round(Math.abs(Math.sin(i * 0.5)) * 62)
    return {
      height,
      opacity: 0.35 + (height / 100) * 0.55,
      accent: i % 5 === 0,
      duration: `${(0.7 + Math.random() * 0.9).toFixed(2)}s`,
      delay: `${(Math.random() * 0.9).toFixed(2)}s`,
    }
  })

/** Decorative animated audio waveform made of CSS-animated equalizer bars. */
export const Waveform: React.FC<WaveformProps> = ({ bars, className }) => {
  const barSpecs = useMemo(() => buildBars(bars), [bars])

  return (
    <div className={cn('flex items-center', className)} aria-hidden="true">
      {barSpecs.map((bar, i) => (
        <i
          key={i}
          className="eq-bar block flex-1 rounded-full"
          style={
            {
              height: `${bar.height}%`,
              background: bar.accent ? '#4f46e5' : '#2563eb',
              opacity: bar.opacity,
              '--dur': bar.duration,
              '--dl': bar.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
