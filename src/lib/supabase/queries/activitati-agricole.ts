// src/lib/supabase/queries/activitati-agricole.ts
import { createClient } from '../client'

// ===============================
// CONSTANTS
// ===============================

export const TIPURI_ACTIVITATI = [
  'Tratament Fungicid',
  'Tratament Insecticid',
  'Tratament Erbicid',
  'Fertilizare Organică',
  'Fertilizare Chimică',
  'Fertilizare Foliară',
  'Irigare',
  'Tundere/Curățare',
  'Altele',
] as const

// ===============================
// TYPES
// ===============================

export interface ActivitateAgricola {
  id: string
  id_activitate: string
  data_aplicare: string
  parcela_id: string | null
  tip_activitate: string | null
  produs_utilizat: string | null
  doza: string | null
  timp_pauza_zile: number
  operator: string | null
  observatii: string | null
  created_at: string
  updated_at: string
}

export interface CreateActivitateAgricolaInput {
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

// ===============================
// INTERNAL HELPERS
// ===============================

async function generateNextId(): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('activitati_agricole')
    .select('id_activitate')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching last activitate ID:', error)
    throw error
  }

  if (!data || data.length === 0) {
    return 'AA001'
  }

  const lastId = data[0].id_activitate
  const numericPart = parseInt(lastId.replace('AA', ''), 10)

  if (isNaN(numericPart)) {
    throw new Error(`Invalid id_activitate format: ${lastId}`)
  }

  const nextNumber = numericPart + 1
  return `AA${nextNumber.toString().padStart(3, '0')}`
}

// ===============================
// QUERIES (RLS-FIRST)
// ===============================

export async function getActivitatiAgricole(): Promise<ActivitateAgricola[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('activitati_agricole')
    .select('*')
    .order('data_aplicare', { ascending: false })

  if (error) {
    console.error('Error fetching activitati:', error)
    throw error
  }

  return data ?? []
}

/**
 * CREATE ACTIVITATE AGRICOLA (RLS-FIRST)
 * 
 * 🔐 RLS REQUIREMENTS:
 * - tenant_id MUST be set automatically via BEFORE INSERT trigger OR RLS WITH CHECK policy
 * - INSERT policy must exist with WITH CHECK validating tenant_id matches current user's tenant
 * 
 * 📋 DB SCHEMA EXPECTATIONS:
 * - tenant_id: NOT NULL (required)
 * - tenant_id: No DEFAULT value (set via trigger)
 * 
 * 🔧 REQUIRED TRIGGER (if not using RLS WITH CHECK to set):
 * CREATE FUNCTION set_tenant_id_activitati()
 * RETURNS trigger AS $$
 * BEGIN
 *   NEW.tenant_id := (
 *     SELECT id FROM tenants
 *     WHERE owner_user_id = auth.uid()
 *   );
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql;
 * 
 * CREATE TRIGGER set_tenant_before_insert_activitati
 * BEFORE INSERT ON activitati_agricole
 * FOR EACH ROW EXECUTE FUNCTION set_tenant_id_activitati();
 * 
 * 🔒 REQUIRED RLS POLICY:
 * CREATE POLICY tenant_isolation_insert_activitati
 * ON activitati_agricole
 * FOR INSERT
 * WITH CHECK (
 *   tenant_id = (
 *     SELECT id FROM tenants
 *     WHERE owner_user_id = auth.uid()
 *   )
 * );
 */
export async function createActivitateAgricola(
  input: CreateActivitateAgricolaInput
): Promise<ActivitateAgricola> {
  const supabase = createClient()
  const nextId = await generateNextId()

  const { data, error } = await supabase
    .from('activitati_agricole')
    .insert({
      id_activitate: nextId,
      data_aplicare: input.data_aplicare,
      parcela_id: input.parcela_id ?? null,
      tip_activitate: input.tip_activitate ?? null,
      produs_utilizat: input.produs_utilizat ?? null,
      doza: input.doza ?? null,
      timp_pauza_zile: input.timp_pauza_zile ?? 0,
      operator: input.operator ?? null,
      observatii: input.observatii ?? null,
      // tenant_id is NOT included - must be set by trigger or RLS policy
    })
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

// ===============================
// DOMAIN LOGIC
// ===============================

export function calculatePauseStatus(
  dataAplicare: string,
  timpPauzaZile: number
): {
  dataRecoltarePermisa: string
  status: 'OK' | 'Pauză'
} {
  const aplicareDate = new Date(dataAplicare)
  const recoltareDate = new Date(aplicareDate)
  recoltareDate.setDate(recoltareDate.getDate() + timpPauzaZile)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return {
    dataRecoltarePermisa: recoltareDate.toISOString().split('T')[0],
    status: today >= recoltareDate ? 'OK' : 'Pauză',
  }
}