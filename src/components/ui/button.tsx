import { cn } from '@/libs/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'rounded-xl inline-flex text-sm font-medium cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'items-center bg-gray-200 hover:bg-gray-300 text-black shadow-2xl',
      },
      size: {
        default: 'h-8 px-4 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
