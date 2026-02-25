import { createClient } from '../client'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Recoltare = Tables<'recoltari'>

export interface CreateRecoltareInput {
  client_sync_id?: string
  sync_status?: string
  data: string
  parcela_id: string
  culegator_id: string
  cantitate_kg: number
  observatii?: string
}

export interface UpdateRecoltareInput {
  data?: string
  parcela_id?: string
  culegator_id?: string
  cantitate_kg?: number
  observatii?: string
}

type RecoltareInsert = TablesInsert<'recoltari'>
type RecoltareUpdate = TablesUpdate<'recoltari'>

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

  if (Number.isNaN(numericPart)) throw new Error('Invalid id_recoltare format')

  const nextNumber = numericPart + 1
  return `REC${nextNumber.toString().padStart(3, '0')}`
}

export async function getRecoltari(): Promise<Recoltare[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('recoltari')
    .select('*')
    .order('data', { ascending: false })

  if (error) throw error

  return data ?? []
}

export async function createRecoltare(input: CreateRecoltareInput): Promise<Recoltare> {
  const supabase = createClient()
  const nextId = await generateNextId()

  const payload = {
    client_sync_id: input.client_sync_id ?? crypto.randomUUID(),
    sync_status: input.sync_status ?? 'synced',
    id_recoltare: nextId,
    data: input.data,
    parcela_id: input.parcela_id,
    culegator_id: input.culegator_id,
    cantitate_kg: input.cantitate_kg,
    observatii: input.observatii ?? null,
  } as RecoltareInsert

  const { data, error } = await supabase
    .from('recoltari')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Eroare la crearea recoltarii:', error.message)
    throw error
  }

  return data
}

export async function updateRecoltare(id: string, input: UpdateRecoltareInput): Promise<Recoltare> {
  const supabase = createClient()
  const payload: RecoltareUpdate = {
    ...input,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('recoltari')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteRecoltare(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('recoltari').delete().eq('id', id)

  if (error) throw error
}
