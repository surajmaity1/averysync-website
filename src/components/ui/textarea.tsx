import { cn } from '@/libs/utils'
import * as React from 'react'

export function Textarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <textarea className={cn('', className)} data-slot="textarea" {...props} />
  )
}
