// src/lib/supabase/queries/vanzari-butasi.ts

import { createClient } from '../client'

// ===============================
// TYPES
// ===============================

export interface VanzareButasi {
  id: string
  id_vanzare_butasi: string
  data: string

  client_id: string | null
  parcela_sursa_id: string | null

  soi_butasi: string
  cantitate_butasi: number
  pret_unitar_lei: number

  observatii: string | null

  created_at: string
  updated_at: string
}

export interface CreateVanzareButasiInput {
  data: string
  client_id?: string
  parcela_sursa_id?: string
  soi_butasi: string
  cantitate_butasi: number
  pret_unitar_lei: number
  observatii?: string
}

export interface UpdateVanzareButasiInput {
  data?: string
  client_id?: string | null
  parcela_sursa_id?: string | null
  soi_butasi?: string
  cantitate_butasi?: number
  pret_unitar_lei?: number
  observatii?: string | null
}

// ===============================
// GENERATE NEXT ID
// ===============================

async function generateNextId(): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vanzari_butasi')
    .select('id_vanzare_butasi')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching last vanzare butasi ID:', error)
    return 'VB001'
  }

  if (!data || data.length === 0) {
    return 'VB001'
  }

  const lastId = data[0].id_vanzare_butasi
  const numericPart = parseInt(lastId.replace('VB', ''), 10)

  if (isNaN(numericPart)) {
    console.error('Invalid ID format:', lastId)
    return 'VB001'
  }

  const nextNumber = numericPart + 1
  return `VB${nextNumber.toString().padStart(3, '0')}`
}

// ===============================
// GET
// ===============================

export async function getVanzariButasi(): Promise<VanzareButasi[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vanzari_butasi')
    .select('*')
    .order('data', { ascending: false })

  if (error) throw error

  return data ?? []
}

// ===============================
// CREATE
// ===============================

export async function createVanzareButasi(
  input: CreateVanzareButasiInput
): Promise<VanzareButasi> {
  const supabase = createClient()
  const nextId = await generateNextId()

  const { data, error } = await supabase
    .from('vanzari_butasi')
    .insert({
      id_vanzare_butasi: nextId,
      data: input.data,
      client_id: input.client_id || null,
      parcela_sursa_id: input.parcela_sursa_id || null,
      soi_butasi: input.soi_butasi,
      cantitate_butasi: input.cantitate_butasi,
      pret_unitar_lei: input.pret_unitar_lei,
      observatii: input.observatii || null,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

// ===============================
// UPDATE
// ===============================

export async function updateVanzareButasi(
  id: string,
  input: UpdateVanzareButasiInput
): Promise<VanzareButasi> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vanzari_butasi')
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

// ===============================
// DELETE
// ===============================

export async function deleteVanzareButasi(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vanzari_butasi')
    .delete()
    .eq('id', id)

  if (error) throw error
}
