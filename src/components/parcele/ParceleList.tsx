'use client'

import { Sprout } from 'lucide-react'

import { CompactListCard } from '@/components/app/CompactListCard'
import { StatusChip } from '@/components/app/StatusChip'
import type { Parcela } from '@/lib/supabase/queries/parcele'

interface ParceleListProps {
  parcele: Parcela[]
  onEdit: (parcela: Parcela) => void
  onDelete: (parcela: Parcela) => void
  parcelProfitMap?: Record<string, { profit: number; margin: number }>
  parcelPauseMap?: Record<string, { remainingDays: number; product?: string | null }>
}

export function ParceleList({ parcele, onEdit, onDelete, parcelProfitMap, parcelPauseMap }: ParceleListProps) {
  return (
    <div className="space-y-3">
      {parcele.map((parcela) => (
        <CompactListCard
          key={parcela.id}
          title={parcela.nume_parcela}
          subtitle={`${parcela.suprafata_m2} m2`}
          metadata={parcela.soi_plantat ? `· ${parcela.soi_plantat}` : undefined}
          status={
            <div className="flex items-center gap-1.5">
              <StatusChip status={parcela.status ?? 'programat'} size="sm" />
              {parcela.soi_plantat ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--agri-border)] px-2 py-0.5 text-xs text-[var(--agri-text-muted)]">
                  <Sprout className="h-3 w-3" />
                  {parcela.soi_plantat}
                </span>
              ) : null}
              {parcelPauseMap?.[parcela.id] ? (
                <span className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                  Pauza: {parcelPauseMap[parcela.id].remainingDays} zile
                </span>
              ) : null}
            </div>
          }
          trailingMeta={
            parcelPauseMap?.[parcela.id]?.product
              ? `Produs: ${parcelPauseMap[parcela.id].product}`
              : parcelProfitMap?.[parcela.id]
                ? `Profit ${parcelProfitMap[parcela.id].profit.toFixed(0)} lei (${parcelProfitMap[parcela.id].margin.toFixed(1)}%)`
                : undefined
          }
          onEdit={() => onEdit(parcela)}
          onDelete={() => onDelete(parcela)}
        />
      ))}
    </div>
  )
}
