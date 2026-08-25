import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary'|'navy'|'outline'|'ghost'|'danger'|'teal'
type Size    = 'sm'|'md'|'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant,string> = {
  primary: 'bg-coral text-white hover:opacity-90',
  navy:    'bg-navy text-white hover:opacity-90',
  outline: 'bg-transparent text-navy border-2 border-navy hover:bg-navy/5',
  ghost:   'bg-transparent text-[#71717A] border border-[#EAE7E2] hover:bg-gray-50',
  danger:  'bg-red-500 text-white hover:bg-red-600',
  teal:    'bg-teal text-white hover:opacity-90',
}
const sizes: Record<Size,string> = {
  sm: 'px-3.5 py-1.5 text-[13px] rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-[10px]',
  lg: 'px-7 py-3.5 text-base rounded-xl',
}

const Button = forwardRef<HTMLButtonElement,ButtonProps>(
  ({ variant='primary', size='md', className, children, ...props }, ref) => (
    <button ref={ref} className={cn('inline-flex items-center gap-2 font-bold cursor-pointer transition-all duration-150 whitespace-nowrap select-none disabled:opacity-50', variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
)
Button.displayName = 'Button'
export default Button
