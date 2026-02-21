import { createClient } from '../client'

// ===============================
// TYPES
// ===============================

export interface Culegator {
  id: string
  tenant_id: string

  id_culegator: string
  nume_prenume: string

  tarif_lei_kg: number

  data_angajare: string | null
  status_activ: boolean

  telefon: string | null
  tip_angajare: string | null
  observatii: string | null

  created_at: string
  updated_at: string
}

export interface CreateCulegatorInput {
  id_culegator: string
  nume_prenume: string
  tarif_lei_kg: number
  data_angajare?: string | null
  status_activ?: boolean
  telefon?: string | null
  tip_angajare?: string | null
  observatii?: string | null
}

export interface UpdateCulegatorInput {
  nume_prenume?: string
  tarif_lei_kg?: number
  data_angajare?: string | null
  status_activ?: boolean
  telefon?: string | null
  tip_angajare?: string | null
  observatii?: string | null
}

// ===============================
// QUERIES (RLS-FIRST)
// ===============================

export async function getCulegatori(): Promise<Culegator[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('culegatori')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data ?? []
}

export async function createCulegator(
  input: CreateCulegatorInput
): Promise<Culegator> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('culegatori')
    .insert({
      ...input,
      status_activ: input.status_activ ?? true,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateCulegator(
  id: string,
  input: UpdateCulegatorInput
): Promise<Culegator> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('culegatori')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteCulegator(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('culegatori')
    .delete()
    .eq('id', id)

  if (error) throw error
}
