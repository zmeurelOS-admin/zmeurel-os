// src/lib/supabase/queries/clienti.ts
import { createClient } from '../client';

export interface Client {
  id: string;
  tenant_id: string;
  id_client: string;
  nume_client: string;
  telefon: string | null;
  email: string | null;
  adresa: string | null;
  pret_negociat_lei_kg: number | null;
  observatii: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  tenant_id: string;
  nume_client: string;
  telefon?: string;
  email?: string;
  adresa?: string;
  pret_negociat_lei_kg?: number;
  observatii?: string;
}

export interface UpdateClientInput {
  nume_client?: string;
  telefon?: string;
  email?: string;
  adresa?: string;
  pret_negociat_lei_kg?: number;
  observatii?: string;
}

async function generateNextId(tenantId: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('clienti')
    .select('id_client')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching last client ID:', error);
    return 'CL001';
  }

  if (!data || data.length === 0) {
    return 'CL001';
  }

  const lastId = data[0].id_client;
  const numericPart = parseInt(lastId.replace('CL', ''), 10);
  
  if (isNaN(numericPart)) {
    console.error('Invalid ID format:', lastId);
    return 'CL001';
  }
  
  const nextNumber = numericPart + 1;
  return `CL${nextNumber.toString().padStart(3, '0')}`;
}

export async function getClienti(tenantId: string): Promise<Client[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('clienti')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('id_client', { ascending: true });

  if (error) {
    console.error('Error fetching clienti:', error);
    throw error;
  }

  return data || [];
}

export async function createNewClient(input: CreateClientInput): Promise<Client> {
  const supabase = createClient();
  const nextId = await generateNextId(input.tenant_id);

  const { data, error } = await supabase
    .from('clienti')
    .insert({
      tenant_id: input.tenant_id,
      id_client: nextId,
      nume_client: input.nume_client,
      telefon: input.telefon || null,
      email: input.email || null,
      adresa: input.adresa || null,
      pret_negociat_lei_kg: input.pret_negociat_lei_kg || null,
      observatii: input.observatii || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }

  return data;
}

export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('clienti')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }

  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('clienti').delete().eq('id', id);

  if (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}
