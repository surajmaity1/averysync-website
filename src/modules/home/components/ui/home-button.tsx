import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyles =
    'px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2'

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5',
    secondary:
      'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    dark: 'bg-slate-900 text-white hover:bg-slate-800',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
