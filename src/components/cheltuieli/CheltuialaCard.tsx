'use client'

import { CompactListCard } from '@/components/app/CompactListCard'
import type { Cheltuiala } from '@/lib/supabase/queries/cheltuieli'

interface CheltuialaCardProps {
  cheltuiala: Cheltuiala
  onEdit: (cheltuiala: Cheltuiala) => void
  onDelete: (id: string, name: string) => void
}

const getCategorieTone = (categorie: string) => {
  const colorMap: Record<string, string> = {
    Electricitate: 'bg-yellow-100 text-yellow-800',
    'Motorină Transport': 'bg-red-100 text-red-800',
    Ambalaje: 'bg-blue-100 text-blue-800',
    Fertilizare: 'bg-green-100 text-green-800',
    Pesticide: 'bg-orange-100 text-orange-800',
    Cules: 'bg-purple-100 text-purple-800',
    'Material Săditor': 'bg-pink-100 text-pink-800',
  }
  return colorMap[categorie] || 'bg-slate-100 text-slate-800'
}

export function CheltuialaCard({ cheltuiala, onEdit, onDelete }: CheltuialaCardProps) {
  const categorie = cheltuiala.categorie || 'Altele'
  const subtitle = `${new Date(cheltuiala.data).toLocaleDateString('ro-RO')} · ${categorie}`
  const metadata = cheltuiala.furnizor || cheltuiala.descriere || undefined

  return (
    <CompactListCard
      title={`-${Number(cheltuiala.suma_lei).toFixed(2)} lei`}
      subtitle={subtitle}
      metadata={metadata}
      status={
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getCategorieTone(categorie)}`}>
          {categorie}
        </span>
      }
      trailingMeta={cheltuiala.sync_status || undefined}
      onEdit={() => onEdit(cheltuiala)}
      onDelete={() => onDelete(cheltuiala.id, `${categorie} - ${cheltuiala.suma_lei} lei`)}
    />
  )
}
