import { getSupabase } from '../client'

// ========================================
// TYPES
// ========================================

export interface Culegator {
  id: string
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

// ========================================
// GENERATE NEXT ID
// ========================================

async function generateNextId(
  supabase: ReturnType<typeof getSupabase>
): Promise<string> {
  const { data, error } = await supabase
    .from('culegatori')
    .select('id_culegator')
    .order('created_at', { ascending: true })

  if (error) throw error

  const ids = (data ?? [])
    .map((r) => r.id_culegator)
    .filter((id) => id && /^CUL\d+$/.test(id))
    .map((id) => parseInt(id!.substring(3)))

  const maxId = ids.length > 0 ? Math.max(...ids) : 0

  return `CUL${String(maxId + 1).padStart(3, '0')}`
}

// ========================================
// GET
// ========================================

export async function getCulegatori(): Promise<Culegator[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('culegatori')
    .select('id,id_culegator,nume_prenume,tarif_lei_kg,data_angajare,status_activ,telefon,tip_angajare,observatii,created_at,updated_at,tenant_id')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []) as unknown as Culegator[]
}

// ========================================
// CREATE (FIXED VERSION)
// ========================================

export async function createCulegator(
  input: CreateCulegatorInput
): Promise<Culegator> {
  const supabase = getSupabase()
  const id_culegator = await generateNextId(supabase)

  const payload = {
    id_culegator,
    nume_prenume: input.nume_prenume,
    tarif_lei_kg: input.tarif_lei_kg,
    data_angajare:
      input.data_angajare && input.data_angajare !== ''
        ? input.data_angajare
        : null,
    status_activ: input.status_activ ?? true,
    telefon:
      input.telefon && input.telefon !== '' ? input.telefon : null,
    tip_angajare:
      input.tip_angajare && input.tip_angajare !== ''
        ? input.tip_angajare
        : null,
    observatii:
      input.observatii && input.observatii !== ''
        ? input.observatii
        : null,
  }

  const { data, error } = await supabase
    .from('culegatori')
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  return data as unknown as Culegator
}

// ========================================
// UPDATE
// ========================================

export async function updateCulegator(
  id: string,
  input: UpdateCulegatorInput
): Promise<Culegator> {
  const supabase = getSupabase()

  const payload = {
    ...input,
    data_angajare:
      input.data_angajare && input.data_angajare !== ''
        ? input.data_angajare
        : null,
    telefon:
      input.telefon && input.telefon !== '' ? input.telefon : null,
    tip_angajare:
      input.tip_angajare && input.tip_angajare !== ''
        ? input.tip_angajare
        : null,
    observatii:
      input.observatii && input.observatii !== ''
        ? input.observatii
        : null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('culegatori')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data as unknown as Culegator
}

// ========================================
// DELETE
// ========================================

export async function deleteCulegator(id: string): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('culegatori')
    .delete()
    .eq('id', id)

  if (error) throw error
}

