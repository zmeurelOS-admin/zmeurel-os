'use client'

import { CompactListCard } from '@/components/app/CompactListCard'
import type { Parcela } from '@/lib/supabase/queries/parcele'

interface ParcelaCardProps {
  parcela: Parcela
  onEdit: () => void
  onDelete: () => void
}

export function ParcelaCard({ parcela, onEdit, onDelete }: ParcelaCardProps) {
  return (
    <CompactListCard
      title={parcela.nume_parcela}
      subtitle={`${parcela.suprafata_m2} m2`}
      metadata={parcela.soi_plantat ? `Soi: ${parcela.soi_plantat}` : undefined}
      status={
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
            parcela.status === 'Activ' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {parcela.status ?? 'Nesetat'}
        </span>
      }
      trailingMeta={parcela.observatii || undefined}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
