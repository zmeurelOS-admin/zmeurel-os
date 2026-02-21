import { createClient } from "@/lib/supabase/client"
import type { Tables, Inserts, Updates } from "@/types/supabase"

export type Parcela = Tables<"parcele">
export type ParcelaInsert = Inserts<"parcele">
export type ParcelaUpdate = Updates<"parcele">

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

  const { data, error } = await supabase
    .from("parcele")
    .insert(input)
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
