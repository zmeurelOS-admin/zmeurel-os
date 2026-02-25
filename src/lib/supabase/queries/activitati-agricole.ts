// src/lib/supabase/queries/activitati-agricole.ts
import { createClient } from '../client'

export const TIPURI_ACTIVITATI = [
  'Tratament Fungicid',
  'Tratament Insecticid',
  'Tratament Erbicid',
  'Fertilizare Organica',
  'Fertilizare Chimica',
  'Fertilizare Foliara',
  'Irigare',
  'Tundere/Curatare',
  'Altele',
] as const

export interface ActivitateAgricola {
  id: string
  id_activitate: string
  client_sync_id: string
  data_aplicare: string
  parcela_id: string | null
  tip_activitate: string | null
  produs_utilizat: string | null
  doza: string | null
  timp_pauza_zile: number
  operator: string | null
  observatii: string | null
  sync_status: string | null
  conflict_flag: boolean | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface CreateActivitateAgricolaInput {
  client_sync_id?: string
  sync_status?: string
  data_aplicare: string
  parcela_id?: string
  tip_activitate?: string
  produs_utilizat?: string
  doza?: string
  timp_pauza_zile?: number
  operator?: string
  observatii?: string
}

export interface UpdateActivitateAgricolaInput {
  data_aplicare?: string
  parcela_id?: string
  tip_activitate?: string
  produs_utilizat?: string
  doza?: string
  timp_pauza_zile?: number
  operator?: string
  observatii?: string
}

async function generateNextId(): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('activitati_agricole')
    .select('id_activitate')
    .like('id_activitate', 'AA%')
    .order('id_activitate', { ascending: false })
    .limit(1)

  if (error) throw error

  if (!data || data.length === 0 || !data[0]?.id_activitate) {
    return 'AA001'
  }

  const lastId = data[0].id_activitate
  const numericPart = parseInt(lastId.replace('AA', ''), 10)

  if (Number.isNaN(numericPart)) {
    return 'AA001'
  }

  const nextNumber = numericPart + 1
  return `AA${nextNumber.toString().padStart(3, '0')}`
}

export async function getActivitatiAgricole(): Promise<ActivitateAgricola[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('activitati_agricole')
    .select('*')
    .order('data_aplicare', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching activitati:', error)
    throw error
  }

  return data ?? []
}

export async function createActivitateAgricola(
  input: CreateActivitateAgricolaInput
): Promise<ActivitateAgricola> {
  const supabase = createClient()
  const nextId = await generateNextId()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('activitati_agricole')
    .upsert(
      {
        client_sync_id: input.client_sync_id ?? crypto.randomUUID(),
        id_activitate: nextId,
        data_aplicare: input.data_aplicare,
        parcela_id: input.parcela_id ?? null,
        tip_activitate: input.tip_activitate ?? null,
        produs_utilizat: input.produs_utilizat ?? null,
        doza: input.doza ?? null,
        timp_pauza_zile: input.timp_pauza_zile ?? 0,
        operator: input.operator ?? null,
        observatii: input.observatii ?? null,
        sync_status: input.sync_status ?? 'synced',
        created_by: user?.id ?? null,
        updated_by: user?.id ?? null,
      },
      { onConflict: 'client_sync_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Error creating activitate:', error)
    throw error
  }

  return data
}

export async function updateActivitateAgricola(
  id: string,
  input: UpdateActivitateAgricolaInput
): Promise<ActivitateAgricola> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('activitati_agricole')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating activitate:', error)
    throw error
  }

  return data
}

export async function deleteActivitateAgricola(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('activitati_agricole')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting activitate:', error)
    throw error
  }
}

export function calculatePauseStatus(
  dataAplicare: string,
  timpPauzaZile: number
): {
  dataRecoltarePermisa: string
  status: 'OK' | 'Pauza'
} {
  const aplicareDate = new Date(dataAplicare)
  const recoltareDate = new Date(aplicareDate)
  recoltareDate.setDate(recoltareDate.getDate() + timpPauzaZile)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return {
    dataRecoltarePermisa: recoltareDate.toISOString().split('T')[0],
    status: today >= recoltareDate ? 'OK' : 'Pauza',
  }
}
