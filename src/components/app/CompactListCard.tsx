'use client'

import { Pencil, Trash2 } from 'lucide-react'

import { useDensity } from '@/components/app/DensityProvider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CompactListCardProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  metadata?: React.ReactNode
  status?: React.ReactNode
  trailingMeta?: React.ReactNode
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function CompactListCard({
  title,
  subtitle,
  metadata,
  status,
  trailingMeta,
  onEdit,
  onDelete,
  className,
}: CompactListCardProps) {
  const { density } = useDensity()

  return (
    <article
      className={cn(
        'rounded-xl border bg-white shadow-sm',
        density === 'compact' ? 'p-2.5' : 'p-3',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 text-base font-semibold text-[var(--agri-text)]">{title}</h3>

        <div className="flex items-center gap-1">
          {onEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center"
              onClick={onEdit}
              aria-label="Editează"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}

          {onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-red-600 hover:bg-red-50"
              onClick={onDelete}
              aria-label="Șterge"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {(subtitle || metadata) ? (
        <div className={cn('mt-1 flex items-center gap-2 text-[var(--agri-text-muted)]', density === 'compact' ? 'text-xs' : 'text-sm')}>
          {subtitle ? <span className="line-clamp-1">{subtitle}</span> : null}
          {metadata ? <span className="line-clamp-1">{metadata}</span> : null}
        </div>
      ) : null}

      {(status || trailingMeta) ? (
        <div className={cn('mt-2 flex items-center justify-between gap-2', density === 'compact' ? '[&_*]:text-[11px]' : '')}>
          <div className="min-w-0">{status}</div>
          {trailingMeta ? <div className="line-clamp-1 text-xs text-[var(--agri-text-muted)]">{trailingMeta}</div> : null}
        </div>
      ) : null}
    </article>
  )
}

