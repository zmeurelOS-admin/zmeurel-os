// src/app/(dashboard)/recoltari/page.tsx

import { createClient } from '@/lib/supabase/server'
import { RecoltariPageClient } from './RecoltariPageClient'
import type { Recoltare } from '@/lib/supabase/queries/recoltari'

export default async function RecoltariPage() {
  const supabase = await createClient()
  let initialError: string | null = null

  const { data: recoltariData, error: recoltariError } = await supabase
    .from('recoltari')
    .select('id,id_recoltare,data,parcela_id,culegator_id,kg_cal1,kg_cal2,pret_lei_pe_kg_snapshot,valoare_munca_lei,observatii,created_at,updated_at,tenant_id')
    .order('data', { ascending: false })

  if (recoltariError) {
    const message = (recoltariError.message || '').toLowerCase()
    if (message.includes('kg_cal1') || message.includes('schema cache') || message.includes('could not find')) {
      initialError =
        'Coloana kg_cal1 lipseste din baza de date. Va rugam rulati migrarile si apoi: SELECT pg_notify(\'pgrst\', \'reload schema\');'
    } else {
      throw recoltariError
    }
  }

  const recoltariRows = recoltariData ?? []

  const recoltari: Recoltare[] = recoltariRows.map((row) => ({
    id: row.id,
    id_recoltare: row.id_recoltare,
    data: row.data,
    parcela_id: row.parcela_id,
    culegator_id: row.culegator_id,
    kg_cal1: Number(row.kg_cal1 ?? 0),
    kg_cal2: Number(row.kg_cal2 ?? 0),
    pret_lei_pe_kg_snapshot: Number(row.pret_lei_pe_kg_snapshot ?? 0),
    valoare_munca_lei: Number(row.valoare_munca_lei ?? 0),
    observatii: row.observatii,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tenant_id: row.tenant_id,
  }))

  const { data: parcele } = await supabase
    .from('parcele')
    .select('id, id_parcela, nume_parcela')
    .order('created_at', { ascending: false })

  return (
    <RecoltariPageClient
      initialRecoltari={recoltari}
      parcele={parcele ?? []}
      initialError={initialError}
    />
  )
}

