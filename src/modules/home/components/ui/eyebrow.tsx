import { cn } from '@/libs/utils'
import React from 'react'

interface EyebrowProps {
  className?: string
  children: React.ReactNode
}

/** Monospace uppercase section label. */
export const Eyebrow: React.FC<EyebrowProps> = ({ className, children }) => (
  <span className={cn('eyebrow', className)}>{children}</span>
)
