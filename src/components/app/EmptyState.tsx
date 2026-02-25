'use client'

import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  primaryAction?:
    | ReactNode
    | {
        label: string
        onClick: () => void
      }
}

function isActionConfig(
  action: EmptyStateProps['primaryAction']
): action is { label: string; onClick: () => void } {
  return typeof action === 'object' && action !== null && 'label' in action && 'onClick' in action
}

export function EmptyState({ title, description, icon, primaryAction }: EmptyStateProps) {
  return (
    <div className="agri-card p-6 text-center sm:p-8">
      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-surface-muted)] text-[var(--agri-text)]">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="text-lg font-bold text-[var(--agri-text)]">{title}</p>
      {description ? <p className="agri-muted mx-auto mt-2 max-w-md text-sm font-medium">{description}</p> : null}
      {primaryAction ? (
        <div className="mx-auto mt-4 w-full max-w-xs">
          {isActionConfig(primaryAction) ? (
            <Button type="button" className="agri-cta w-full bg-[var(--agri-primary)] text-white hover:bg-emerald-700" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          ) : (
            primaryAction
          )}
        </div>
      ) : null}
    </div>
  )
}
