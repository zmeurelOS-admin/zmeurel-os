// src/lib/supabase/queries/recoltari.ts
import { createClient } from '../client';

export interface Recoltare {
  id: string;
  tenant_id: string;
  id_recoltare: string;
  data: string;
  culegator_id: string | null;
  parcela_id: string | null;
  nr_caserole: number;
  tara_kg: number;
  observatii: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRecoltareInput {
  tenant_id: string;
  data: string;
  culegator_id?: string;
  parcela_id?: string;
  nr_caserole: number;
  tara_kg?: number;
  observatii?: string;
}

export interface UpdateRecoltareInput {
  data?: string;
  culegator_id?: string;
  parcela_id?: string;
  nr_caserole?: number;
  tara_kg?: number;
  observatii?: string;
}

async function generateNextId(tenantId: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('recoltari')
    .select('id_recoltare')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching last recoltare ID:', error);
    return 'R001';
  }

  if (!data || data.length === 0) {
    return 'R001';
  }

  const lastId = data[0].id_recoltare;
  const numericPart = parseInt(lastId.replace('R', ''), 10);
  
  if (isNaN(numericPart)) {
    console.error('Invalid ID format:', lastId);
    return 'R001';
  }
  
  const nextNumber = numericPart + 1;
  return `R${nextNumber.toString().padStart(3, '0')}`;
}

export async function getRecoltari(tenantId: string): Promise<Recoltare[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('recoltari')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('data', { ascending: false });

  if (error) {
    console.error('Error fetching recoltari:', error);
    throw error;
  }

  return data || [];
}

export async function createRecoltare(input: CreateRecoltareInput): Promise<Recoltare> {
  const supabase = createClient();
  const nextId = await generateNextId(input.tenant_id);

  const { data, error } = await supabase
    .from('recoltari')
    .insert({
      tenant_id: input.tenant_id,
      id_recoltare: nextId,
      data: input.data,
      culegator_id: input.culegator_id || null,
      parcela_id: input.parcela_id || null,
      nr_caserole: input.nr_caserole,
      tara_kg: input.tara_kg || 0,
      observatii: input.observatii || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating recoltare:', error);
    throw error;
  }

  return data;
}

export async function updateRecoltare(id: string, input: UpdateRecoltareInput): Promise<Recoltare> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('recoltari')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating recoltare:', error);
    throw error;
  }

  return data;
}

export async function deleteRecoltare(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('recoltari').delete().eq('id', id);

  if (error) {
    console.error('Error deleting recoltare:', error);
    throw error;
  }
}
