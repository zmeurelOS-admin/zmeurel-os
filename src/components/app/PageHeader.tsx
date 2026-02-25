'use client'

import { FarmSwitcher } from '@/components/app/FarmSwitcher'
import { HighVisibilityToggle } from '@/components/app/HighVisibilityToggle'
import { SyncStatusIndicator } from '@/components/app/SyncStatusIndicator'

interface PageHeaderProps {
  title: string
  subtitle?: string
  rightSlot?: React.ReactNode
  farmSwitcher?: React.ReactNode
}

export function PageHeader({ title, subtitle, rightSlot, farmSwitcher }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden px-4 pb-4 pt-[calc(var(--safe-t)+12px)]">
      <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-emerald-800 to-emerald-600" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-emerald-100">{subtitle}</p> : null}
          </div>

          <div>{farmSwitcher ?? <FarmSwitcher />}</div>
        </div>

        <div className="flex w-full items-center justify-end gap-2 text-white sm:w-auto">
          <SyncStatusIndicator />
          {rightSlot ? <div>{rightSlot}</div> : null}
          <HighVisibilityToggle />
        </div>
      </div>
    </header>
  )
}
