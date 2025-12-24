import { cn } from '@/libs/utils'
import * as LabelPrimitive from '@radix-ui/react-label'

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn('', className)}
      {...props}
    ></LabelPrimitive.Root>
  )
}
