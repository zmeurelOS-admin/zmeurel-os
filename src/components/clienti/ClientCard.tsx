'use client'

import { CompactListCard } from '@/components/app/CompactListCard'
import type { Client } from '@/lib/supabase/queries/clienti'

interface ClientCardProps {
  client: Client
  onEdit: (client: Client) => void
  onDelete: (id: string, name: string) => void
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const subtitle = [client.telefon, client.email].filter(Boolean).join(' · ')
  const metadata = client.adresa || client.observatii || undefined

  return (
    <CompactListCard
      title={client.nume_client}
      subtitle={subtitle || undefined}
      metadata={metadata}
      status={
        client.pret_negociat_lei_kg && client.pret_negociat_lei_kg > 0 ? (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            {client.pret_negociat_lei_kg} lei/kg
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
            Fara pret special
          </span>
        )
      }
      trailingMeta={client.id_client}
      onEdit={() => onEdit(client)}
      onDelete={() => onDelete(client.id, client.nume_client)}
    />
  )
}
