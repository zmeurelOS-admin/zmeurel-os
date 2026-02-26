import { getSupabase } from "@/lib/supabase/client"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase"

export type Parcela = Tables<"parcele">
export type ParcelaInsert = TablesInsert<"parcele">
export type ParcelaUpdate = TablesUpdate<"parcele">

// =====================
// GET
// =====================

export async function getParcele(): Promise<Parcela[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("parcele")
    .select("id,id_parcela,nume_parcela,tip_fruct,soi_plantat,suprafata_m2,nr_plante,an_plantare,status,gps_lat,gps_lng,observatii,created_at,updated_at,tenant_id")
    .order("created_at", { ascending: false })

  if (error) throw error

  return data ?? []
}

// =====================
// CREATE
// =====================

export async function createParcela(
  input: ParcelaInsert
): Promise<Parcela> {
  const supabase = getSupabase()

  // 1. VerificÄm cine este userul real direct pe "server" (clientul Supabase securizat)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Neautorizat. Trebuie sÄ fii logat.")

  // 2. Suprascriem tenant_id cu ID-ul real, ca sÄ nu poatÄ fi falsificat
  const { data, error } = await supabase
    .from("parcele")
    .insert({
      ...input,
      tenant_id: user.id // <--- LACÄ‚TUL TÄ‚U AICI
    })
    .select("id,id_parcela,nume_parcela,tip_fruct,soi_plantat,suprafata_m2,nr_plante,an_plantare,status,gps_lat,gps_lng,observatii,created_at,updated_at,tenant_id")
    .single()

  if (error) throw error

  return data
}

// =====================
// UPDATE
// =====================

export async function updateParcela(
  id: string,
  input: ParcelaUpdate
): Promise<Parcela> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("parcele")
    .update(input)
    .eq("id", id)
    .select("id,id_parcela,nume_parcela,tip_fruct,soi_plantat,suprafata_m2,nr_plante,an_plantare,status,gps_lat,gps_lng,observatii,created_at,updated_at,tenant_id")
    .single()

  if (error) throw error

  return data
}

// =====================
// DELETE
// =====================

export async function deleteParcela(id: string): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from("parcele")
    .delete()
    .eq("id", id)

  if (error) throw error
}


