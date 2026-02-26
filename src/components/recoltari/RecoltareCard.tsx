'use client'

import { CompactListCard } from '@/components/app/CompactListCard'
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
  const kgCal1 = Number(recoltare.kg_cal1 ?? 0)
  const kgCal2 = Number(recoltare.kg_cal2 ?? 0)
  const totalKg = kgCal1 + kgCal2
  const subtitle = `${new Date(recoltare.data).toLocaleDateString('ro-RO')} - ${kgCal1.toFixed(2)} kg C1 - ${kgCal2.toFixed(2)} kg C2`
  const metadata = [parcelaNume, culegatorNume].filter(Boolean).join(' - ')

  const costMuncaSnapshot = Number(recoltare.valoare_munca_lei ?? 0)
  const costMunca = costMuncaSnapshot > 0 ? costMuncaSnapshot : (culegatorTarif ? totalKg * culegatorTarif : 0)

  return (
    <CompactListCard
      title="Recoltare"
      subtitle={subtitle}
      metadata={metadata || undefined}
      status={
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            Inregistrata
          </span>
        </div>
      }
      trailingMeta={costMunca > 0 ? `De plata: ${costMunca.toFixed(2)} lei` : recoltare.observatii || undefined}
      onEdit={() => onEdit(recoltare)}
      onDelete={() => onDelete(recoltare)}
    />
  )
}
