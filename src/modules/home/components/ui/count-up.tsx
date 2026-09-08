import React, { useEffect, useRef } from 'react'

interface CountUpProps {
  /** Final value to count up to. */
  value: number
  /** Decimal places to keep while formatting (e.g. 1 for "1.9"). */
  decimals?: number
  className?: string
}

const DURATION_MS = 1500

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

const format = (value: number, decimals: number) =>
  decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString('en-US')

/**
 * Animates a number from 0 to `value` the first time it scrolls into view.
 * Renders the final value immediately for reduced-motion users.
 */
export const CountUp: React.FC<CountUpProps> = ({
  value,
  decimals = 0,
  className,
}) => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let frameId = 0

    const run = () => {
      let start: number | null = null
      const frame = (timestamp: number) => {
        if (start === null) start = timestamp
        const progress = Math.min((timestamp - start) / DURATION_MS, 1)
        element.textContent = format(value * easeOutCubic(progress), decimals)
        if (progress < 1) frameId = requestAnimationFrame(frame)
      }
      frameId = requestAnimationFrame(frame)
    }

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      element.textContent = format(value, decimals)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run()
            observer.disconnect()
          }
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameId)
    }
  }, [value, decimals])

  return (
    <span ref={ref} className={className}>
      0
    </span>
  )
}
