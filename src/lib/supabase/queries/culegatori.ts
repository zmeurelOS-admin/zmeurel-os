// src/lib/supabase/queries/culegatori.ts
import { createClient } from '../client';

export interface Culegator {
  id: string;
  tenant_id: string;
  id_culegator: string;
  nume_prenume: string;
  telefon: string | null;
  tip_angajare: string;
  tarif_lei_kg: number;
  data_angajare: string | null;
  status_activ: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCulegatorInput {
  tenant_id: string;
  nume_prenume: string;
  telefon?: string;
  tip_angajare?: string;
  tarif_lei_kg?: number;
  data_angajare?: string;
  status_activ?: boolean;
}

export interface UpdateCulegatorInput {
  nume_prenume?: string;
  telefon?: string;
  tip_angajare?: string;
  tarif_lei_kg?: number;
  data_angajare?: string;
  status_activ?: boolean;
}

async function generateNextId(tenantId: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('culegatori')
    .select('id_culegator')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching last culegator ID:', error);
    return 'C001';
  }

  if (!data || data.length === 0) {
    return 'C001';
  }

  const lastId = data[0].id_culegator;
  const numericPart = parseInt(lastId.replace('C', ''), 10);
  
  if (isNaN(numericPart)) {
    console.error('Invalid ID format:', lastId);
    return 'C001';
  }
  
  const nextNumber = numericPart + 1;
  return `C${nextNumber.toString().padStart(3, '0')}`;
}

export async function getCulegatori(tenantId: string): Promise<Culegator[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('culegatori')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('id_culegator', { ascending: true });

  if (error) {
    console.error('Error fetching culegatori:', error);
    throw error;
  }

  return data || [];
}

export async function createCulegator(input: CreateCulegatorInput): Promise<Culegator> {
  const supabase = createClient();
  const nextId = await generateNextId(input.tenant_id);

  const { data, error } = await supabase
    .from('culegatori')
    .insert({
      tenant_id: input.tenant_id,
      id_culegator: nextId,
      nume_prenume: input.nume_prenume,
      telefon: input.telefon || null,
      tip_angajare: input.tip_angajare || 'Sezonier',
      tarif_lei_kg: input.tarif_lei_kg || 0,
      data_angajare: input.data_angajare || null,
      status_activ: input.status_activ ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating culegator:', error);
    throw error;
  }

  return data;
}

export async function updateCulegator(id: string, input: UpdateCulegatorInput): Promise<Culegator> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('culegatori')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating culegator:', error);
    throw error;
  }

  return data;
}

export async function deleteCulegator(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('culegatori').delete().eq('id', id);

  if (error) {
    console.error('Error deleting culegator:', error);
    throw error;
  }
}
