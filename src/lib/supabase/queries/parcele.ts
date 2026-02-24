import { createClient } from "@/lib/supabase/client"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase"

export type Parcela = Tables<"parcele">
export type ParcelaInsert = TablesInsert<"parcele">
export type ParcelaUpdate = TablesUpdate<"parcele">

// =====================
// GET
// =====================

export async function getParcele(): Promise<Parcela[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("parcele")
    .select("*")
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
  const supabase = createClient()

  // 1. Verificăm cine este userul real direct pe "server" (clientul Supabase securizat)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Neautorizat. Trebuie să fii logat.")

  // 2. Suprascriem tenant_id cu ID-ul real, ca să nu poată fi falsificat
  const { data, error } = await supabase
    .from("parcele")
    .insert({
      ...input,
      tenant_id: user.id // <--- LACĂTUL TĂU AICI
    })
    .select("*")
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
  const supabase = createClient()

  const { data, error } = await supabase
    .from("parcele")
    .update(input)
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw error

  return data
}

// =====================
// DELETE
// =====================

export async function deleteParcela(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from("parcele")
    .delete()
    .eq("id", id)

  if (error) throw error
}