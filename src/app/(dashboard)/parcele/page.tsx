import { createClient } from '@/lib/supabase/server'
import { ParcelePageClient } from '@/components/parcele/ParcelePageClient'

export default async function ParcelePage() {
  const supabase = await createClient()

  const { data: parcele, error } = await supabase
    .from('parcele')
    .select('*')
    .order('created_at', { ascending: false })

  return <ParcelePageClient initialParcele={parcele ?? []} initialError={error?.message ?? null} />
}
