import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/supabase"

export type Client = Tables<"clienti">

export interface CreateClientInput {
  nume_client: string
  telefon?: string | null
  email?: string | null
  adresa?: string | null
  pret_negociat_lei_kg?: number | null
  observatii?: string | null
}

export interface UpdateClientInput {
  nume_client?: string
  telefon?: string | null
  email?: string | null
  adresa?: string | null
  pret_negociat_lei_kg?: number | null
  observatii?: string | null
}

export async function getClienti(): Promise<Client[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("clienti")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createClienti(input: CreateClientInput): Promise<Client> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("clienti")
    .insert({
      nume_client: input.nume_client,
      telefon: input.telefon ?? null,
      email: input.email ?? null,
      adresa: input.adresa ?? null,
      pret_negociat_lei_kg: input.pret_negociat_lei_kg ?? null,
      observatii: input.observatii ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateClienti(
  id: string,
  input: UpdateClientInput
): Promise<Client> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("clienti")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteClienti(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from("clienti")
    .delete()
    .eq("id", id)

  if (error) throw error
}
