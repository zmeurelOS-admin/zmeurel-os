import { createClient } from '@/lib/supabase/server'
import { StocuriPageClient } from './StocuriPageClient'

export default async function StocuriPage() {
  const supabase = await createClient()

  const { data: parcele = [] } = await supabase
    .from('parcele')
    .select('id,nume_parcela')
    .order('nume_parcela', { ascending: true })

  return <StocuriPageClient initialParcele={parcele ?? []} />
}
