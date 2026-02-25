'use client'

import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'

import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  className?: string
}

const trendMap = {
  up: {
    label: 'Trend crescator',
    icon: ArrowUpRight,
    className: 'text-emerald-700 bg-emerald-100',
  },
  down: {
    label: 'Trend descrescator',
    icon: ArrowDownRight,
    className: 'text-red-700 bg-red-100',
  },
  neutral: {
    label: 'Trend stabil',
    icon: ArrowRight,
    className: 'text-slate-800 bg-slate-200',
  },
} as const

export function KpiCard({
  title,
  value,
  subtitle,
  trend = 'neutral',
  icon,
  className,
}: KpiCardProps) {
  const trendConfig = trendMap[trend]
  const TrendIcon = trendConfig.icon

  return (
    <article className={cn('agri-card p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--agri-text-muted)]">
            {title}
          </p>
          <p className="text-3xl font-black leading-none text-[var(--agri-text)] sm:text-4xl">
            {value}
          </p>
          {subtitle ? <p className="text-sm font-medium text-[var(--agri-text-muted)]">{subtitle}</p> : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          {icon ? (
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-surface-muted)] text-[var(--agri-text)]">
              {icon}
            </div>
          ) : null}
          <span
            aria-label={trendConfig.label}
            className={cn(
              'inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold',
              trendConfig.className
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Stabil'}
          </span>
        </div>
      </div>
    </article>
  )
}

export function KpiCardSkeleton() {
  return (
    <article className="agri-card animate-pulse p-4 sm:p-5">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded bg-slate-200" />
        <div className="h-10 w-32 rounded bg-slate-300" />
        <div className="h-4 w-40 rounded bg-slate-200" />
      </div>
    </article>
  )
}
