'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'

import { calculateProfit } from '@/lib/calculations/profit'

interface ProfitSummaryCardProps {
  revenue: number
  cost: number
  title?: string
  subtitle?: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ProfitSummaryCard({
  revenue,
  cost,
  title = 'Profit',
  subtitle = 'Venit vs cost',
}: ProfitSummaryCardProps) {
  const metrics = calculateProfit(revenue, cost)
  const positive = metrics.profit >= 0

  return (
    <article className={`agri-card p-4 sm:p-5 ${positive ? 'border-emerald-500' : 'border-red-500'}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--agri-text-muted)]">{title}</p>
          <p className="mt-1 text-sm font-medium text-[var(--agri-text-muted)]">{subtitle}</p>
        </div>
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
            positive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {positive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-surface-muted)] p-2.5">
          <dt className="text-xs font-semibold uppercase text-[var(--agri-text-muted)]">Venit</dt>
          <dd className="mt-1 text-base font-bold text-[var(--agri-text)]">{formatCurrency(metrics.revenue)}</dd>
        </div>
        <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-surface-muted)] p-2.5">
          <dt className="text-xs font-semibold uppercase text-[var(--agri-text-muted)]">Cost</dt>
          <dd className="mt-1 text-base font-bold text-[var(--agri-text)]">{formatCurrency(metrics.cost)}</dd>
        </div>
        <div className={`rounded-xl border p-2.5 ${positive ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}`}>
          <dt className="text-xs font-semibold uppercase text-[var(--agri-text-muted)]">Profit</dt>
          <dd className={`mt-1 text-base font-black ${positive ? 'text-emerald-800' : 'text-red-800'}`}>
            {formatCurrency(metrics.profit)}
          </dd>
        </div>
        <div className={`rounded-xl border p-2.5 ${positive ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}`}>
          <dt className="text-xs font-semibold uppercase text-[var(--agri-text-muted)]">Marja</dt>
          <dd className={`mt-1 text-base font-black ${positive ? 'text-emerald-800' : 'text-red-800'}`}>
            {metrics.margin.toFixed(1)}%
          </dd>
        </div>
      </dl>
    </article>
  )
}
