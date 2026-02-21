// src/lib/supabase/queries/vanzari-butasi.ts

import { createClient } from '../client'

// ===============================
// TYPES
// ===============================

export interface VanzareButasi {
  id: string
  id_vanzare_butasi: string
  data: string
  tenant_id: string

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

  const { data, error } = await supabase
    .from('vanzari_butasi')
    .insert(input)
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
