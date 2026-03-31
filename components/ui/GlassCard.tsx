'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow, hoverable, padding = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass rounded-2xl',
          glow && 'glow-green',
          hoverable && 'glass-hover cursor-pointer transition-all duration-200',
          padding === 'sm' && 'p-3',
          padding === 'md' && 'p-4',
          padding === 'lg' && 'p-6',
          padding === 'none' && '',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
