import { createClient } from '@/lib/supabase/server'
import { ParcelePageClient } from '@/components/parcele/ParcelePageClient'

export default async function ParcelePage() {
  const supabase = await createClient()

  const { data: parcele, error } = await supabase
    .from('parcele')
    .select('id,id_parcela,nume_parcela,tip_fruct,soi_plantat,suprafata_m2,nr_plante,an_plantare,status,gps_lat,gps_lng,observatii,created_at,updated_at,tenant_id')
    .order('created_at', { ascending: false })

  return <ParcelePageClient initialParcele={parcele ?? []} initialError={error?.message ?? null} />
}

