// src/app/(dashboard)/vanzari-butasi/page.tsx

import { createClient } from '@/lib/supabase/server'
import { VanzariButasiPageClient } from './VanzariButasiPageClient'
import type { VanzareButasi } from '@/lib/supabase/queries/vanzari-butasi'

export default async function VanzariButasiPage() {
  const supabase = await createClient()

  // RLS handles tenant isolation automatically - no manual auth check needed (middleware handles it)
  const { data: vanzariButasi } = await supabase
    .from('vanzari_butasi')
    .select('*')
    .order('data', { ascending: false })

  const { data: clienti } = await supabase
    .from('clienti')
    .select('id, id_client, nume_client')

  const { data: parcele } = await supabase
    .from('parcele')
    .select('id, id_parcela, nume_parcela')

  // Type-safe fallback pentru null
  const safeVanzari: VanzareButasi[] = vanzariButasi ?? []
  const safeClienti = clienti ?? []
  const safeParcele = parcele ?? []

  return (
    <VanzariButasiPageClient
      initialVanzari={safeVanzari}
      clienti={safeClienti}
      parcele={safeParcele}
    />
  )
}
