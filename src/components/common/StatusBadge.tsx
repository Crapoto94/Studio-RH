import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
  className?: string
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
        status === 'success' && 'badge-success',
        status === 'warning' && 'badge-warning',
        status === 'error'   && 'badge-error',
        status === 'info'    && 'badge-info',
        className
      )}
    >
      {children}
    </span>
  )
}
