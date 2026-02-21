// src/app/(dashboard)/investitii/page.tsx

import { createClient } from '@/lib/supabase/server'
import { InvestitiiPageClient } from './InvestitiiPageClient'

export default async function InvestitiiPage() {
  const supabase = await createClient()

  const { data: investitii } = await supabase
    .from('investitii')
    .select('*')
    .order('data', { ascending: false })

  const { data: parcele } = await supabase
    .from('parcele')
    .select('id, id_parcela, nume_parcela')
    .order('created_at', { ascending: false })

  return (
    <InvestitiiPageClient
      initialInvestitii={investitii ?? []}
      parcele={parcele ?? []}
    />
  )
}
