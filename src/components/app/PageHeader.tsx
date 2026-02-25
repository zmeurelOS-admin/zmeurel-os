'use client'

import { CompactPageHeader } from '@/components/layout/CompactPageHeader'
import { HighVisibilityToggle } from '@/components/app/HighVisibilityToggle'
import { SyncStatusIndicator } from '@/components/app/SyncStatusIndicator'

interface PageHeaderProps {
  title: string
  subtitle?: string
  rightSlot?: React.ReactNode
  summary?: React.ReactNode
}

export function PageHeader({ title, subtitle, rightSlot, summary }: PageHeaderProps) {
  return (
    <CompactPageHeader
      title={title}
      subtitle={subtitle}
      summary={summary}
      rightSlot={
        <div className="flex items-center justify-end gap-2 text-white">
          <SyncStatusIndicator />
          {rightSlot ? <div>{rightSlot}</div> : null}
          <HighVisibilityToggle />
        </div>
      }
    />
  )
}
