'use client'

import { CompactListCard } from '@/components/app/CompactListCard'
import { BADGE_COLORS, Investitie } from '@/lib/supabase/queries/investitii'

interface InvestitieCardProps {
  investitie: Investitie
  parcelaNume?: string
  onEdit: (investitie: Investitie) => void
  onDelete: (investitie: Investitie) => void
}

export function InvestitieCard({ investitie, parcelaNume, onEdit, onDelete }: InvestitieCardProps) {
  const categorie = investitie.categorie || 'Altele'
  const subtitle = `${new Date(investitie.data).toLocaleDateString('ro-RO')} · ${categorie}`
  const metadata = [parcelaNume ? `Parcela: ${parcelaNume}` : null, investitie.furnizor].filter(Boolean).join(' · ')

  return (
    <CompactListCard
      title={`Investitie -${Number(investitie.suma_lei).toFixed(2)} lei`}
      subtitle={subtitle}
      metadata={metadata || investitie.descriere || undefined}
      status={
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE_COLORS[categorie] || 'bg-slate-100 text-slate-700'}`}>
          {categorie}
        </span>
      }
      trailingMeta={investitie.id_investitie}
      onEdit={() => onEdit(investitie)}
      onDelete={() => onDelete(investitie)}
    />
  )
}
