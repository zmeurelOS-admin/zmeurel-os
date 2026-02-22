// src/lib/supabase/queries/vanzari.ts
import { createClient } from '../client';

// Constants
export const STATUS_PLATA = ['Plătit', 'Restanță', 'Avans'] as const;

export interface Vanzare {
  id: string;
  id_vanzare: string;
  data: string;
  client_id: string | null;
  cantitate_kg: number;
  pret_lei_kg: number;
  pret_unitar_lei: number;
  status_plata: string;
  observatii_ladite: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVanzareInput {
  data: string;
  client_id?: string;
  cantitate_kg: number;
  pret_lei_kg: number;
  status_plata?: string;
  observatii_ladite?: string;
}

export interface UpdateVanzareInput {
  data?: string;
  client_id?: string;
  cantitate_kg?: number;
  pret_lei_kg?: number;
  status_plata?: string;
  observatii_ladite?: string;
}

async function generateNextId(): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('vanzari')
    .select('id_vanzare')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching last vanzare ID:', error);
    return 'V001';
  }

  if (!data || data.length === 0) {
    return 'V001';
  }

  const lastId = data[0].id_vanzare;
  const numericPart = parseInt(lastId.replace('V', ''), 10);
  
  if (isNaN(numericPart)) {
    console.error('Invalid ID format:', lastId);
    return 'V001';
  }
  
  const nextNumber = numericPart + 1;
  return `V${nextNumber.toString().padStart(3, '0')}`;
}

export async function getVanzari(): Promise<Vanzare[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('vanzari')
    .select('*')
    .order('data', { ascending: false });

  if (error) {
    console.error('Error fetching vanzari:', error);
    throw error;
  }

  return data || [];
}

export async function createVanzare(input: CreateVanzareInput): Promise<Vanzare> {
  const supabase = createClient();
  const nextId = await generateNextId();

  const { data, error } = await supabase
    .from('vanzari')
    .insert({
      id_vanzare: nextId,
      data: input.data,
      client_id: input.client_id || null,
      cantitate_kg: input.cantitate_kg,
      pret_lei_kg: input.pret_lei_kg,
      status_plata: input.status_plata || 'Plătit',
      observatii_ladite: input.observatii_ladite || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating vanzare:', error);
    throw error;
  }

  return data;
}

export async function updateVanzare(id: string, input: UpdateVanzareInput): Promise<Vanzare> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('vanzari')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating vanzare:', error);
    throw error;
  }

  return data;
}

export async function deleteVanzare(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('vanzari').delete().eq('id', id);

  if (error) {
    console.error('Error deleting vanzare:', error);
    throw error;
  }
}
