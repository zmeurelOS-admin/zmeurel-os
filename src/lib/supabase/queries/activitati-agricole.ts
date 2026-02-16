// src/lib/supabase/queries/activitati-agricole.ts
import { createClient } from '../client';

// Constants
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
] as const;

export interface ActivitateAgricola {
  id: string;
  tenant_id: string;
  id_activitate: string;
  data_aplicare: string;
  parcela_id: string | null;
  tip_activitate: string | null;
  produs_utilizat: string | null;
  doza: string | null;
  timp_pauza_zile: number;
  operator: string | null;
  observatii: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateActivitateAgricolaInput {
  tenant_id: string;
  data_aplicare: string;
  parcela_id?: string;
  tip_activitate?: string;
  produs_utilizat?: string;
  doza?: string;
  timp_pauza_zile?: number;
  operator?: string;
  observatii?: string;
}

export interface UpdateActivitateAgricolaInput {
  data_aplicare?: string;
  parcela_id?: string;
  tip_activitate?: string;
  produs_utilizat?: string;
  doza?: string;
  timp_pauza_zile?: number;
  operator?: string;
  observatii?: string;
}

async function generateNextId(tenantId: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('activitati_agricole')
    .select('id_activitate')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching last activitate ID:', error);
    return 'AA001';
  }

  if (!data || data.length === 0) {
    return 'AA001';
  }

  const lastId = data[0].id_activitate;
  const numericPart = parseInt(lastId.replace('AA', ''), 10);
  
  if (isNaN(numericPart)) {
    console.error('Invalid ID format:', lastId);
    return 'AA001';
  }
  
  const nextNumber = numericPart + 1;
  return `AA${nextNumber.toString().padStart(3, '0')}`;
}

export async function getActivitatiAgricole(tenantId: string): Promise<ActivitateAgricola[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('activitati_agricole')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('data_aplicare', { ascending: false });

  if (error) {
    console.error('Error fetching activitati:', error);
    throw error;
  }

  return data || [];
}

export async function createActivitateAgricola(input: CreateActivitateAgricolaInput): Promise<ActivitateAgricola> {
  const supabase = createClient();
  const nextId = await generateNextId(input.tenant_id);

  const { data, error } = await supabase
    .from('activitati_agricole')
    .insert({
      tenant_id: input.tenant_id,
      id_activitate: nextId,
      data_aplicare: input.data_aplicare,
      parcela_id: input.parcela_id || null,
      tip_activitate: input.tip_activitate || null,
      produs_utilizat: input.produs_utilizat || null,
      doza: input.doza || null,
      timp_pauza_zile: input.timp_pauza_zile || 0,
      operator: input.operator || null,
      observatii: input.observatii || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating activitate:', error);
    throw error;
  }

  return data;
}

export async function updateActivitateAgricola(id: string, input: UpdateActivitateAgricolaInput): Promise<ActivitateAgricola> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('activitati_agricole')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating activitate:', error);
    throw error;
  }

  return data;
}

export async function deleteActivitateAgricola(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('activitati_agricole').delete().eq('id', id);

  if (error) {
    console.error('Error deleting activitate:', error);
    throw error;
  }
}

export function calculatePauseStatus(dataAplicare: string, timpPauzaZile: number): {
  dataRecoltarePermisa: string;
  status: 'OK' | 'Pauză';
} {
  const aplicareDate = new Date(dataAplicare);
  const recoltareDate = new Date(aplicareDate);
  recoltareDate.setDate(recoltareDate.getDate() + timpPauzaZile);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return {
    dataRecoltarePermisa: recoltareDate.toISOString().split('T')[0],
    status: today >= recoltareDate ? 'OK' : 'Pauză',
  };
}
