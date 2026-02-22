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

async function generateNextId(supabase: ReturnType<typeof createClient>): Promise<string> {
  const { data, error } = await supabase
    .from("clienti")
    .select("id_client")
    .order("created_at", { ascending: true })

  if (error) throw error

  const ids = (data ?? [])
    .map((r) => r.id_client)
    .filter((id) => id && /^C\d+$/.test(id))
    .map((id) => parseInt(id!.substring(1)))

  const maxId = ids.length > 0 ? Math.max(...ids) : 0
  return `C${String(maxId + 1).padStart(3, "0")}`
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

  const id_client = await generateNextId(supabase)

  const { data, error } = await supabase
    .from("clienti")
    .insert({
      id_client,
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