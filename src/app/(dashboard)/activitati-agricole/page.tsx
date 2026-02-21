// src/app/(dashboard)/activitati-agricole/page.tsx

import { createClient } from '@/lib/supabase/server'
import { ActivitatiAgricolePageClient } from './ActivitatiAgricolePageClient'

export default async function ActivitatiAgricolePage() {
  const supabase = await createClient() // ← important

  const { data: activitati } = await supabase
    .from('activitati_agricole')
    .select('*')
    .order('data_aplicare', { ascending: false })

  const { data: parcele } = await supabase
    .from('parcele')
    .select('id, id_parcela, nume_parcela')
    .order('created_at', { ascending: false })

  return (
    <ActivitatiAgricolePageClient
      initialActivitati={activitati ?? []}
      parcele={parcele ?? []}
    />
  )
}
