import { cn } from '@/libs/utils'
import * as React from 'react'

export function Input({
  type,
  className,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex rounded-xl border px-2 py-0.5 text-sm outline-none hover:shadow-md focus-visible:ring-[0.5px]',
        className,
      )}
      data-slot="input"
      {...props}
    />
  )
}
