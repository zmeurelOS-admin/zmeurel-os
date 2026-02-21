// src/app/(dashboard)/recoltari/page.tsx

import { createClient } from '@/lib/supabase/server'
import { RecoltariPageClient } from './RecoltariPageClient'

export default async function RecoltariPage() {
  const supabase = await createClient()

  const { data: recoltari } = await supabase
    .from('recoltari')
    .select('*')
    .order('data', { ascending: false })

  const { data: parcele } = await supabase
    .from('parcele')
    .select('id, id_parcela, nume_parcela')
    .order('created_at', { ascending: false })

  return (
    <RecoltariPageClient
      initialRecoltari={recoltari ?? []}
      parcele={parcele ?? []}
    />
  )
}
