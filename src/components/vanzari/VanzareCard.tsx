'use client'

import { AlertTriangle, Calendar, Info } from 'lucide-react'

import { CompactListCard } from '@/components/app/CompactListCard'
import { SyncBadge } from '@/components/app/SyncBadge'
import { Vanzare } from '@/lib/supabase/queries/vanzari'

interface VanzareCardProps {
  vanzare: Vanzare
  clientNume?: string
  onEdit: (vanzare: Vanzare) => void
  onDelete: (vanzare: Vanzare) => void
}

const getBadgeColor = (status: string) => {
  switch (status) {
    case 'Platit':
    case 'Plătit':
      return 'bg-emerald-100 text-emerald-800'
    case 'Restanta':
    case 'Restanță':
      return 'bg-red-100 text-red-800'
    case 'Avans':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

export function VanzareCard({ vanzare, clientNume, onEdit, onDelete }: VanzareCardProps) {
  const valoareTotala = vanzare.cantitate_kg * vanzare.pret_lei_kg
  const subtitle = `${new Date(vanzare.data).toLocaleDateString('ro-RO')} · ${vanzare.cantitate_kg.toFixed(2)} kg`
  const metadata = `${vanzare.pret_lei_kg.toFixed(2)} lei/kg · ${valoareTotala.toFixed(2)} lei`

  return (
    <CompactListCard
      title="Vanzare"
      subtitle={subtitle}
      metadata={clientNume ? `· ${clientNume}` : undefined}
      status={
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getBadgeColor(vanzare.status_plata)}`}>
            {vanzare.status_plata}
          </span>
          <SyncBadge status={vanzare.sync_status} />
          {vanzare.conflict_flag ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
              <AlertTriangle className="h-3 w-3" />
              Conflict
            </span>
          ) : null}
        </div>
      }
      trailingMeta={
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {metadata}
          <span title="Audit disponibil in detalii">
            <Info className="h-3.5 w-3.5" />
          </span>
        </span>
      }
      onEdit={() => onEdit(vanzare)}
      onDelete={() => onDelete(vanzare)}
    />
  )
}
