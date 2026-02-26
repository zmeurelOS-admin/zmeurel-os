'use client'

import { Badge } from '@/components/ui/badge'
import { CompactListCard } from '@/components/app/CompactListCard'
import { type VanzareButasi, type VanzareButasiStatus } from '@/lib/supabase/queries/vanzari-butasi'

interface VanzareButasiCardProps {
  vanzare: VanzareButasi
  clientNume?: string
  parcelaNume?: string
  onEdit: (vanzare: VanzareButasi) => void
  onDelete: (vanzare: VanzareButasi) => void
}

const statusClasses: Record<VanzareButasiStatus, string> = {
  noua: 'bg-slate-100 text-slate-700',
  confirmata: 'bg-emerald-100 text-emerald-800',
  pregatita: 'bg-blue-100 text-blue-800',
  livrata: 'bg-green-100 text-green-800',
  anulata: 'bg-red-100 text-red-700',
}

const statusLabels: Record<VanzareButasiStatus, string> = {
  noua: 'Noua',
  confirmata: 'Confirmata',
  pregatita: 'Pregatita',
  livrata: 'Livrata',
  anulata: 'Anulata',
}

function formatLei(value: number): string {
  return `${value.toFixed(2)} lei`
}

export function VanzareButasiCard({
  vanzare,
  clientNume,
  parcelaNume,
  onEdit,
  onDelete,
}: VanzareButasiCardProps) {
  const restDeIncasat = Number(vanzare.total_lei) - Number(vanzare.avans_suma)
  const deliveryDate = vanzare.data_livrare_estimata
    ? new Date(vanzare.data_livrare_estimata).toLocaleDateString('ro-RO')
    : 'Nespecificata'

  return (
    <CompactListCard
      title={clientNume || 'Client necunoscut'}
      subtitle={`Livrare: ${deliveryDate}`}
      metadata={parcelaNume ? `Parcela: ${parcelaNume}` : undefined}
      status={
        <div className="flex items-center gap-2">
          <Badge className={statusClasses[vanzare.status]}>{statusLabels[vanzare.status]}</Badge>
          {restDeIncasat > 0 ? (
            <Badge className="bg-amber-100 text-amber-800">Rest: {formatLei(restDeIncasat)}</Badge>
          ) : null}
        </div>
      }
      trailingMeta={`Total: ${formatLei(Number(vanzare.total_lei))}`}
      onEdit={() => onEdit(vanzare)}
      onDelete={() => onDelete(vanzare)}
    />
  )
}
