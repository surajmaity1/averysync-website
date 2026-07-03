import React, { useEffect, useState } from 'react'

interface LiveCountProps {
  /** Starting value for the ticker. */
  initial: number
  className?: string
}

const TICK_MS = 2600
/** Only a fraction of ticks mutate, so several tickers don't move in lockstep. */
const TICK_PROBABILITY = 0.4

/**
 * A "live" number that occasionally drifts up (and sometimes down) to give
 * the page a sense of real-time activity. Static under reduced motion.
 */
export const LiveCount: React.FC<LiveCountProps> = ({ initial, className }) => {
  const [count, setCount] = useState(initial)
  const [justIncreased, setJustIncreased] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let flashTimeout: ReturnType<typeof setTimeout>
    const interval = setInterval(() => {
      if (Math.random() > TICK_PROBABILITY) return
      const delta = Math.random() < 0.55 ? 1 : Math.random() < 0.5 ? 2 : -1
      setCount((current) => Math.max(1, current + delta))
      if (delta > 0) {
        setJustIncreased(true)
        flashTimeout = setTimeout(() => setJustIncreased(false), 450)
      }
    }, TICK_MS)

    return () => {
      clearInterval(interval)
      clearTimeout(flashTimeout)
    }
  }, [])

  return (
    <span
      className={className}
      style={{
        transition: 'color .3s ease',
        color: justIncreased ? '#059669' : undefined,
      }}
    >
      {count.toLocaleString('en-US')}
    </span>
  )
}
