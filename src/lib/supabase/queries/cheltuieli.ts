// src/lib/supabase/queries/cheltuieli.ts
import { createClient } from '../client';

export interface Cheltuiala {
  id: string;
  id_cheltuiala: string;
  data: string;
  categorie: string | null;
  descriere: string | null;
  suma_lei: number;
  furnizor: string | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCheltuialaInput {
  data: string;
  categorie?: string;
  descriere?: string;
  suma_lei: number;
  furnizor?: string;
  document_url?: string;
}

export interface UpdateCheltuialaInput {
  data?: string;
  categorie?: string;
  descriere?: string;
  suma_lei?: number;
  furnizor?: string;
  document_url?: string;
}

/**
 * 🔐 RLS-FIRST ARCHITECTURE
 * 
 * tenant_id is NOT sent from client code.
 * RLS policies + database triggers handle tenant isolation.
 */

async function generateNextId(): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cheltuieli_diverse')
    .select('id_cheltuiala')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching last cheltuiala ID:', error);
    return 'CH001';
  }

  if (!data || data.length === 0) {
    return 'CH001';
  }

  const lastId = data[0].id_cheltuiala;
  const numericPart = parseInt(lastId.replace('CH', ''), 10);

  if (isNaN(numericPart)) {
    console.error('Invalid ID format:', lastId);
    return 'CH001';
  }

  const nextNumber = numericPart + 1;
  return `CH${nextNumber.toString().padStart(3, '0')}`;
}

export async function getCheltuieli(): Promise<Cheltuiala[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cheltuieli_diverse')
    .select('*')
    .order('data', { ascending: false });

  if (error) {
    console.error('Error fetching cheltuieli:', error);
    throw error;
  }

  return data ?? [];
}

/**
 * CREATE CHELTUIALA (RLS-FIRST)
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
 * CREATE FUNCTION set_tenant_id_cheltuieli()
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
 * CREATE TRIGGER set_tenant_before_insert_cheltuieli
 * BEFORE INSERT ON cheltuieli_diverse
 * FOR EACH ROW EXECUTE FUNCTION set_tenant_id_cheltuieli();
 * 
 * 🔒 REQUIRED RLS POLICY:
 * CREATE POLICY tenant_isolation_insert_cheltuieli
 * ON cheltuieli_diverse
 * FOR INSERT
 * WITH CHECK (
 *   tenant_id = (
 *     SELECT id FROM tenants
 *     WHERE owner_user_id = auth.uid()
 *   )
 * );
 */
export async function createCheltuiala(
  input: CreateCheltuialaInput
): Promise<Cheltuiala> {
  const supabase = createClient();
  const nextId = await generateNextId();

  const { data, error } = await supabase
    .from('cheltuieli_diverse')
    .insert({
      id_cheltuiala: nextId,
      data: input.data,
      categorie: input.categorie || null,
      descriere: input.descriere || null,
      suma_lei: input.suma_lei,
      furnizor: input.furnizor || null,
      document_url: input.document_url || null,
      // tenant_id is NOT included - must be set by trigger or RLS policy
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating cheltuiala:', error);
    throw error;
  }

  return data;
}

export async function updateCheltuiala(
  id: string,
  input: UpdateCheltuialaInput
): Promise<Cheltuiala> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cheltuieli_diverse')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating cheltuiala:', error);
    throw error;
  }

  return data;
}

export async function deleteCheltuiala(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('cheltuieli_diverse')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting cheltuiala:', error);
    throw error;
  }
}
