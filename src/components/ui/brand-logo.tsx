import { cn } from '@/libs/utils'
import React from 'react'

/**
 * The single source of truth for the Averysync logo asset. It lives in
 * `public/` and is also the browser favicon, so the mark shown in-app always
 * matches the tab icon and the installed-app icon.
 */
export const BRAND_LOGO_SRC = '/favicon.ico'

export interface BrandLogoProps {
  /** Mark size in pixels (square). */
  size?: number
  /** Render the "Averysync" wordmark beside the mark. */
  withWordmark?: boolean
  /** Extra classes for the logo mark image. */
  className?: string
  /** Extra classes for the wordmark text. */
  wordmarkClassName?: string
  /**
   * Accessible name for the mark. Defaults to "Averysync". Pass an empty
   * string when an adjacent visible wordmark already names the logo, so the
   * name is not announced twice. Ignored when `withWordmark` is set (the
   * rendered wordmark makes the mark decorative automatically).
   */
  label?: string
}

/**
 * Canonical Averysync brand logo. Every surface — marketing, feed, legal,
 * error pages — must render the logo through this component so the platform
 * stays visually consistent. Never hand-roll another logo (an inline
 * `<img src="/favicon.ico">`, an icon, or bespoke markup); a guard test
 * (tests/unit/logo-consistency.test.ts) enforces this.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 36,
  withWordmark = false,
  className,
  wordmarkClassName,
  label,
}) => {
  const alt = withWordmark ? '' : (label ?? 'Averysync')

  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src={BRAND_LOGO_SRC}
        alt={alt}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={cn('block shrink-0 rounded-[22%] object-contain', className)}
      />
      {withWordmark && (
        <span
          className={cn(
            'tracking-tightest text-[17px] font-bold text-slate-900',
            wordmarkClassName,
          )}
        >
          Averysync
        </span>
      )}
    </span>
  )
}
