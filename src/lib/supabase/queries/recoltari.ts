import { createClient } from '../client'

// ===============================
// TYPES (ALINIATE LA DB REAL)
// ===============================

export interface Recoltare {
  id: string
  id_recoltare: string
  data: string
  parcela_id: string | null
  culegator_id: string | null
  cantitate_kg: number
  nr_caserole: number
  tara_kg: number
  observatii: string | null
  tenant_id: string // Am adăugat tenant_id în interfață
  created_at: string
  updated_at: string
}

export interface CreateRecoltareInput {
  data: string
  parcela_id: string
  culegator_id: string
  cantitate_kg: number
  nr_caserole?: number
  tara_kg?: number
  observatii?: string
}

export interface UpdateRecoltareInput {
  data?: string
  parcela_id?: string
  culegator_id?: string
  cantitate_kg?: number
  nr_caserole?: number
  tara_kg?: number
  observatii?: string
}

// ===============================
// INTERNAL ID GENERATOR
// ===============================

async function generateNextId(): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('recoltari')
    .select('id_recoltare')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error

  if (!data || data.length === 0) return 'REC001'

  const lastId = data[0].id_recoltare
  const numericPart = parseInt(lastId.replace('REC', ''), 10)

  if (isNaN(numericPart)) throw new Error('Invalid id_recoltare format')

  const nextNumber = numericPart + 1
  return `REC${nextNumber.toString().padStart(3, '0')}`
}

// ===============================
// QUERIES (RLS-FIRST)
// ===============================

export async function getRecoltari(): Promise<Recoltare[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('recoltari')
    .select('*')
    .order('data', { ascending: false })

  if (error) throw error

  return data ?? []
}

export async function createRecoltare(
  input: CreateRecoltareInput
): Promise<Recoltare> {
  const supabase = createClient()
  
  // 1. Aflăm cine este utilizatorul logat
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Trebuie să fii autentificat pentru a adăuga date.")

  const nextId = await generateNextId()

  // 2. Trimitem tenant_id: user.id către baza de date
  const { data, error } = await supabase
    .from('recoltari')
    .insert({
      id_recoltare: nextId,
      data: input.data,
      parcela_id: input.parcela_id,
      culegator_id: input.culegator_id,
      cantitate_kg: input.cantitate_kg,
      nr_caserole: input.nr_caserole ?? 1,
      tara_kg: input.tara_kg ?? 0,
      observatii: input.observatii ?? null,
      tenant_id: user.id, // <--- LACĂTUL DE SECURITATE
    })
    .select()
    .single()

  if (error) {
    console.error("Eroare la crearea recoltării:", error.message)
    throw error
  }

  return data
}

export async function updateRecoltare(
  id: string,
  input: UpdateRecoltareInput
): Promise<Recoltare> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('recoltari')
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

export async function deleteRecoltare(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('recoltari')
    .delete()
    .eq('id', id)

  if (error) throw error
}