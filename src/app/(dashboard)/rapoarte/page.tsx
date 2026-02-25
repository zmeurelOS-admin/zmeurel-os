import { createClient } from '@/lib/supabase/server'
import { RapoartePageClient } from './RapoartePageClient'

export default async function RapoartePage() {
  const supabase = await createClient()

  const [{ data: recoltari = [] }, { data: vanzari = [] }, { data: cheltuieli = [] }, { data: parcele = [] }, { data: culegatori = [] }, { data: clienti = [] }] =
    await Promise.all([
      supabase
        .from('recoltari')
        .select('id,id_recoltare,data,parcela_id,culegator_id,cantitate_kg')
        .order('data', { ascending: false }),
      supabase
        .from('vanzari')
        .select('id,id_vanzare,data,client_id,cantitate_kg,pret_lei_kg')
        .order('data', { ascending: false }),
      supabase
        .from('cheltuieli_diverse')
        .select('id,id_cheltuiala,data,categorie,suma_lei')
        .order('data', { ascending: false }),
      supabase
        .from('parcele')
        .select('id,id_parcela,nume_parcela,soi_plantat'),
      supabase
        .from('culegatori')
        .select('id,id_culegator,nume_prenume'),
      supabase
        .from('clienti')
        .select('id,id_client,nume_client'),
    ])

  return (
    <RapoartePageClient
      initialRecoltari={recoltari ?? []}
      initialVanzari={vanzari ?? []}
      initialCheltuieli={cheltuieli ?? []}
      initialParcele={parcele ?? []}
      initialCulegatori={culegatori ?? []}
      initialClienti={clienti ?? []}
    />
  )
}
