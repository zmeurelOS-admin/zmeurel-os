// src/app/(dashboard)/vanzari-butasi/page.tsx

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { VanzariButasiPageClient } from './VanzariButasiPageClient'
import type { VanzareButasi } from '@/lib/supabase/queries/vanzari-butasi'

export default async function VanzariButasiPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  // Verificare user autentificat
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Autentificare necesară</div>
  }

  // 🔒 RLS-first: fără tenantId, fără .eq('tenant_id')

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
