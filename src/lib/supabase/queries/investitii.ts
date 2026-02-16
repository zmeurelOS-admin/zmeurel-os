// src/lib/supabase/queries/investitii.ts
import { createClient } from '../client';

// Constants
export const CATEGORII_INVESTITII = [
  'Butași',
  'Spalieri & Sârmă',
  'Sistem Irigație',
  'Transport & Logistică',
  'Manoperă Plantare',
  'Alte Investiții',
] as const;

export const BADGE_COLORS: Record<string, string> = {
  'Butași': 'bg-green-100 text-green-800',
  'Spalieri & Sârmă': 'bg-blue-100 text-blue-800',
  'Sistem Irigație': 'bg-cyan-100 text-cyan-800',
  'Transport & Logistică': 'bg-purple-100 text-purple-800',
  'Manoperă Plantare': 'bg-yellow-100 text-yellow-800',
  'Alte Investiții': 'bg-gray-100 text-gray-800',
};

export interface Investitie {
  id: string;
  tenant_id: string;
  id_investitie: string;
  data: string;
  parcela_id: string | null;
  categorie: string | null;
  furnizor: string | null;
  descriere: string | null;
  suma_lei: number;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestitieInput {
  tenant_id: string;
  data: string;
  parcela_id?: string;
  categorie?: string;
  furnizor?: string;
  descriere?: string;
  suma_lei: number;
  document_url?: string;
}

export interface UpdateInvestitieInput {
  data?: string;
  parcela_id?: string;
  categorie?: string;
  furnizor?: string;
  descriere?: string;
  suma_lei?: number;
  document_url?: string;
}

async function generateNextId(tenantId: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('investitii')
    .select('id_investitie')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching last investitie ID:', error);
    return 'I001';
  }

  if (!data || data.length === 0) {
    return 'I001';
  }

  const lastId = data[0].id_investitie;
  const numericPart = parseInt(lastId.replace('I', ''), 10);
  
  if (isNaN(numericPart)) {
    console.error('Invalid ID format:', lastId);
    return 'I001';
  }
  
  const nextNumber = numericPart + 1;
  return `I${nextNumber.toString().padStart(3, '0')}`;
}

export async function getInvestitii(tenantId: string): Promise<Investitie[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('investitii')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('data', { ascending: false });

  if (error) {
    console.error('Error fetching investitii:', error);
    throw error;
  }

  return data || [];
}

export async function createInvestitie(input: CreateInvestitieInput): Promise<Investitie> {
  const supabase = createClient();
  const nextId = await generateNextId(input.tenant_id);

  const { data, error } = await supabase
    .from('investitii')
    .insert({
      tenant_id: input.tenant_id,
      id_investitie: nextId,
      data: input.data,
      parcela_id: input.parcela_id || null,
      categorie: input.categorie || null,
      furnizor: input.furnizor || null,
      descriere: input.descriere || null,
      suma_lei: input.suma_lei,
      document_url: input.document_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating investitie:', error);
    throw error;
  }

  return data;
}

export async function updateInvestitie(id: string, input: UpdateInvestitieInput): Promise<Investitie> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('investitii')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating investitie:', error);
    throw error;
  }

  return data;
}

export async function deleteInvestitie(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('investitii').delete().eq('id', id);

  if (error) {
    console.error('Error deleting investitie:', error);
    throw error;
  }
}
