'use client'

import { CompactListCard } from '@/components/app/CompactListCard'
import { VanzareButasi } from '@/lib/supabase/queries/vanzari-butasi'

interface VanzareButasiCardProps {
  vanzare: VanzareButasi
  clientNume?: string
  parcelaNume?: string
  onEdit: (vanzare: VanzareButasi) => void
  onDelete: (vanzare: VanzareButasi) => void
}

export function VanzareButasiCard({
  vanzare,
  clientNume,
  parcelaNume,
  onEdit,
  onDelete,
}: VanzareButasiCardProps) {
  const valoareTotala = vanzare.cantitate_butasi * vanzare.pret_unitar_lei
  const subtitle = `${new Date(vanzare.data).toLocaleDateString('ro-RO')} · ${vanzare.soi_butasi}`
  const metadata = `${vanzare.cantitate_butasi} butasi · ${vanzare.pret_unitar_lei.toFixed(2)} lei/buc`

  return (
    <CompactListCard
      title="Vanzare butasi"
      subtitle={subtitle}
      metadata={clientNume ? `· ${clientNume}` : undefined}
      status={
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
          {parcelaNume ? `Sursa: ${parcelaNume}` : 'Material saditor'}
        </span>
      }
      trailingMeta={`${metadata} · ${valoareTotala.toFixed(2)} lei`}
      onEdit={() => onEdit(vanzare)}
      onDelete={() => onDelete(vanzare)}
    />
  )
}
