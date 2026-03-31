'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none',
          'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed',
          fullWidth && 'w-full',

          // Sizes
          size === 'sm' && 'px-4 py-2 text-sm gap-1.5',
          size === 'md' && 'px-5 py-3 text-sm gap-2',
          size === 'lg' && 'px-6 py-3.5 text-base gap-2',
          size === 'xl' && 'px-8 py-4 text-base gap-2.5',

          // Variants
          variant === 'primary' && [
            'bg-gradient-to-r from-green-500 to-green-400 text-black',
            'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
            'hover:shadow-[0_0_30px_rgba(74,222,128,0.45)] hover:from-green-400 hover:to-green-300',
            'btn-glow',
          ],
          variant === 'secondary' && [
            'bg-white/8 text-green-400 border border-green-500/30',
            'hover:bg-white/12 hover:border-green-400/50',
          ],
          variant === 'ghost' && [
            'bg-transparent text-white/70',
            'hover:bg-white/5 hover:text-white',
          ],
          variant === 'danger' && [
            'bg-gradient-to-r from-red-600 to-red-500 text-white',
            'hover:from-red-500 hover:to-red-400',
            'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
          ],

          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Загрузка...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

GradientButton.displayName = 'GradientButton'
