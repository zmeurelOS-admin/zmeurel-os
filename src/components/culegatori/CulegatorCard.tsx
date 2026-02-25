'use client'

import { CompactListCard } from '@/components/app/CompactListCard'
import type { Culegator } from '@/lib/supabase/queries/culegatori'

interface CulegatorCardProps {
  culegator: Culegator
  onEdit: (culegator: Culegator) => void
  onDelete: (id: string, name: string) => void
}

export function CulegatorCard({ culegator, onEdit, onDelete }: CulegatorCardProps) {
  const subtitle = [culegator.telefon, culegator.tip_angajare].filter(Boolean).join(' · ')
  const metadata = culegator.data_angajare
    ? `Angajat: ${new Date(culegator.data_angajare).toLocaleDateString('ro-RO')}`
    : undefined

  return (
    <CompactListCard
      title={culegator.nume_prenume}
      subtitle={subtitle || undefined}
      metadata={metadata}
      status={
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
            culegator.status_activ ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {culegator.status_activ ? 'Activ' : 'Inactiv'}
        </span>
      }
      trailingMeta={`${culegator.tarif_lei_kg} lei/kg`}
      onEdit={() => onEdit(culegator)}
      onDelete={() => onDelete(culegator.id, culegator.nume_prenume)}
    />
  )
}
