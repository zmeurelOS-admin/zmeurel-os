// src/lib/supabase/queries/cheltuieli.ts
import { createClient } from '../client';

export interface Cheltuiala {
  id: string;
  tenant_id: string;
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
  tenant_id: string;
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

async function generateNextId(tenantId: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cheltuieli_diverse')
    .select('id_cheltuiala')
    .eq('tenant_id', tenantId)
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

export async function getCheltuieli(tenantId: string): Promise<Cheltuiala[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cheltuieli_diverse')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('data', { ascending: false });

  if (error) {
    console.error('Error fetching cheltuieli:', error);
    throw error;
  }

  return data || [];
}

export async function createCheltuiala(input: CreateCheltuialaInput): Promise<Cheltuiala> {
  const supabase = createClient();
  const nextId = await generateNextId(input.tenant_id);

  const { data, error } = await supabase
    .from('cheltuieli_diverse')
    .insert({
      tenant_id: input.tenant_id,
      id_cheltuiala: nextId,
      data: input.data,
      categorie: input.categorie || null,
      descriere: input.descriere || null,
      suma_lei: input.suma_lei,
      furnizor: input.furnizor || null,
      document_url: input.document_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating cheltuiala:', error);
    throw error;
  }

  return data;
}

export async function updateCheltuiala(id: string, input: UpdateCheltuialaInput): Promise<Cheltuiala> {
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

  const { error } = await supabase.from('cheltuieli_diverse').delete().eq('id', id);

  if (error) {
    console.error('Error deleting cheltuiala:', error);
    throw error;
  }
}
