import { cn } from '@/libs/utils'
import { LucideIcon } from 'lucide-react'
import { Label } from './lable'

type FormInputProps = {
  label: string
  htmlFor?: string
  direction?: 'row' | 'column'
  required?: boolean
  children: React.ReactNode
  icon?: LucideIcon
  errorMessage?: string
}

export const FormInput = ({
  label,
  htmlFor,
  direction = 'row',
  required,
  children,
  icon: Icon,
  errorMessage,
}: FormInputProps) => {
  return (
    <div className={cn('flex items-center')}>
      <div className={cn('w-32 shrink-0')}>
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-lg text-rose-400">*</span>}
        </Label>
      </div>
      {children}
      {errorMessage && <p className="text-xs text-rose-400">{errorMessage}</p>}
    </div>
  )
}
