import { createClient } from '@/lib/supabase/server'
import { CulegatorPageClient } from './CulegatorPageClient'

export default async function Page() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('culegatori')
    .select('id,id_culegator,nume_prenume,tarif_lei_kg,data_angajare,status_activ,telefon,tip_angajare,observatii,created_at,updated_at,tenant_id')
    .order('created_at', { ascending: false })

  return <CulegatorPageClient initialCulegatori={data ?? []} />
}

