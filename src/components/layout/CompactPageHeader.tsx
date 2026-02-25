'use client'

interface CompactPageHeaderProps {
  title?: string
  subtitle?: string
  rightSlot?: React.ReactNode
  summary?: React.ReactNode
}

export function CompactPageHeader({ title, subtitle, rightSlot, summary }: CompactPageHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-b-2xl px-4 pt-[calc(var(--safe-t)+12px)] pb-3 sm:px-6 sm:pt-[calc(var(--safe-t)+16px)] sm:pb-5">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-600 to-emerald-700" />

      <div className="relative mx-auto w-full max-w-4xl">
        {(title || subtitle || rightSlot) && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              {title ? <h1 className="truncate text-xl font-semibold text-white sm:text-2xl">{title}</h1> : null}
              {subtitle ? <p className="text-xs text-emerald-100 sm:text-sm">{subtitle}</p> : null}
            </div>
            {rightSlot ? <div className="shrink-0 text-white">{rightSlot}</div> : null}
          </div>
        )}

        {summary ? <div className="mt-2">{summary}</div> : null}
      </div>
    </header>
  )
}
