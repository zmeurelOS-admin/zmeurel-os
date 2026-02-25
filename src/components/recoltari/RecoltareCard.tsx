'use client'

import { AlertTriangle } from 'lucide-react'

import { CompactListCard } from '@/components/app/CompactListCard'
import { SyncBadge } from '@/components/app/SyncBadge'
import { Recoltare } from '@/lib/supabase/queries/recoltari'

interface RecoltareCardProps {
  recoltare: Recoltare
  culegatorNume?: string
  culegatorTarif?: number
  parcelaNume?: string
  onEdit: (recoltare: Recoltare) => void
  onDelete: (recoltare: Recoltare) => void
}

export function RecoltareCard({
  recoltare,
  culegatorNume,
  culegatorTarif,
  parcelaNume,
  onEdit,
  onDelete,
}: RecoltareCardProps) {
  const recoltareWithMeta = recoltare as Recoltare & {
    sync_status?: string | null
    conflict_flag?: boolean | null
  }

  const subtitle = `${new Date(recoltare.data).toLocaleDateString('ro-RO')} · ${recoltare.cantitate_kg.toFixed(2)} kg`
  const metadata = [parcelaNume, culegatorNume].filter(Boolean).join(' · ')
  const costMunca = culegatorTarif ? recoltare.cantitate_kg * culegatorTarif : 0

  return (
    <CompactListCard
      title="Recoltare"
      subtitle={subtitle}
      metadata={metadata || undefined}
      status={
        <div className="flex items-center gap-1.5">
          <SyncBadge status={recoltareWithMeta.sync_status} />
          {recoltareWithMeta.conflict_flag ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
              <AlertTriangle className="h-3 w-3" />
              Conflict
            </span>
          ) : null}
        </div>
      }
      trailingMeta={culegatorTarif ? `Cost munca: ${costMunca.toFixed(2)} lei` : recoltare.observatii || undefined}
      onEdit={() => onEdit(recoltare)}
      onDelete={() => onDelete(recoltare)}
    />
  )
}
