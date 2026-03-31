'use client'

import { cn } from '@/lib/utils'
import { PROJECT_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants'

interface StatusPillProps {
  status: string
  type?: 'project' | 'payment'
  size?: 'sm' | 'md'
  className?: string
}

export function StatusPill({ status, type = 'project', size = 'md', className }: StatusPillProps) {
  const labels = type === 'payment' ? PAYMENT_STATUS_LABELS : PROJECT_STATUS_LABELS
  const label = labels[status] || status

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        `status-${status}`,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {label}
    </span>
  )
}
