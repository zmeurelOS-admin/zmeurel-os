'use client'

import { CompactListCard } from '@/components/app/CompactListCard'
import { SyncBadge } from '@/components/app/SyncBadge'
import { ActivitateAgricola } from '@/lib/supabase/queries/activitati-agricole'

interface ActivitateAgricolaCardProps {
  activitate: ActivitateAgricola
  parcelaNume?: string
  onEdit: (activitate: ActivitateAgricola) => void
  onDelete: (activitate: ActivitateAgricola) => void
}

export function ActivitateAgricolaCard({ activitate, parcelaNume, onEdit, onDelete }: ActivitateAgricolaCardProps) {
  const subtitle = `${new Date(activitate.data_aplicare).toLocaleDateString('ro-RO')} · ${activitate.produs_utilizat || '-'}`
  const metadata = [parcelaNume, activitate.doza].filter(Boolean).join(' · ')

  return (
    <CompactListCard
      title={activitate.tip_activitate || activitate.id_activitate}
      subtitle={subtitle}
      metadata={metadata || undefined}
      status={<SyncBadge status={activitate.sync_status} />}
      trailingMeta={activitate.timp_pauza_zile > 0 ? `Pauza: ${activitate.timp_pauza_zile} zile` : undefined}
      onEdit={() => onEdit(activitate)}
      onDelete={() => onDelete(activitate)}
    />
  )
}
