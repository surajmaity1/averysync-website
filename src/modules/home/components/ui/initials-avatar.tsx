import { cn } from '@/libs/utils'
import React from 'react'

export interface AvatarColor {
  bg: string
  fg: string
}

interface InitialsAvatarProps {
  initials: string
  color: AvatarColor
  /** Size + typography classes, e.g. "h-9 w-9 text-[11px]". */
  className?: string
  /** Adds the pulsing "speaking" ring. */
  speaking?: boolean
}

/** Circular initials avatar matching the design's `.av` treatment. */
export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  initials,
  color,
  className,
  speaking = false,
}) => (
  <span
    className={cn('av', speaking && 'speaking', className)}
    style={{ background: color.bg, color: color.fg }}
  >
    {initials}
  </span>
)
