'use client'

import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreditBadgeProps {
  credits: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CreditBadge({ credits, size = 'md', className }: CreditBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full',
        'bg-green-500/15 text-green-400 border border-green-500/25',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-4 py-1.5 text-base',
        className
      )}
    >
      <Zap
        className={cn(
          'fill-green-400',
          size === 'sm' && 'w-3 h-3',
          size === 'md' && 'w-3.5 h-3.5',
          size === 'lg' && 'w-4 h-4'
        )}
      />
      {credits}
    </div>
  )
}
