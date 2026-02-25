'use client'

import { cn } from '@/lib/utils'
import {
  CUSTOM_STATUS_FALLBACK,
  resolveStatusKey,
  STATUS_CONFIG,
  type StandardStatus,
} from '@/components/app/status-config'

interface StatusChipProps {
  status: StandardStatus | string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<NonNullable<StatusChipProps['size']>, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3 text-sm gap-2',
  lg: 'h-11 px-3.5 text-sm gap-2.5',
}

const iconSizeClasses: Record<NonNullable<StatusChipProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4.5 w-4.5',
}

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const rawStatus = String(status ?? '').trim()
  const normalized = resolveStatusKey(rawStatus)

  const config = normalized ? STATUS_CONFIG[normalized] : CUSTOM_STATUS_FALLBACK
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold tracking-wide',
        sizeClasses[size],
        config.className
      )}
      aria-label={`Status ${normalized ? config.label : rawStatus || config.label}`}
    >
      <Icon className={iconSizeClasses[size]} />
      <span>{normalized ? config.label : rawStatus || config.label}</span>
    </span>
  )
}
