import { cn } from '@/libs/utils'
import React, { useEffect, useRef } from 'react'

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger delay in seconds, applied via the `--d` custom property. */
  delay?: number
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Fades and slides its content in the first time it enters the viewport.
 * Falls back to an immediate reveal when the user prefers reduced motion
 * or IntersectionObserver is unavailable.
 */
export const Reveal: React.FC<RevealProps> = ({
  delay = 0,
  className,
  style,
  children,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      element.classList.add('in')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.disconnect()
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn('reveal', className)}
      style={{ '--d': `${delay}s`, ...style } as React.CSSProperties}
      {...rest}
    >
      {children}
    </div>
  )
}
