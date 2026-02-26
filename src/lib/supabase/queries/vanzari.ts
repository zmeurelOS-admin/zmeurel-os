// src/lib/supabase/queries/vanzari.ts
import { getSupabase } from '../client';

// Constants
export const STATUS_PLATA = ['Platit', 'Restanta', 'Avans'] as const;

export interface Vanzare {
  id: string;
  id_vanzare: string;
  client_sync_id: string;
  data: string;
  client_id: string | null;
  cantitate_kg: number;
  pret_lei_kg: number;
  pret_unitar_lei: number;
  status_plata: string;
  observatii_ladite: string | null;
  sync_status: string | null;
  conflict_flag: boolean | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVanzareInput {
  client_sync_id?: string;
  sync_status?: string;
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

type SupabaseLikeError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

const isMissingColumnError = (error: SupabaseLikeError, column: string) =>
  error?.code === 'PGRST204' || error?.message?.includes(`'${column}'`);

const shouldFallbackToLegacyInsert = (error: unknown) => {
  const e = (error ?? {}) as SupabaseLikeError;
  const message = (e.message ?? '').toLowerCase();
  const code = e.code ?? '';

  if (!e || (Object.keys(e).length === 0 && e.constructor === Object)) return true;

  return (
    code === 'PGRST204' || // missing column in PostgREST schema cache
    code === '42703' || // undefined column
    code === '42P10' || // invalid ON CONFLICT target
    isMissingColumnError(e, 'client_sync_id') ||
    isMissingColumnError(e, 'sync_status') ||
    isMissingColumnError(e, 'created_by') ||
    isMissingColumnError(e, 'updated_by') ||
    message.includes('client_sync_id') ||
    message.includes('on conflict')
  );
};

const toReadableError = (error: unknown, fallbackMessage: string) => {
  const e = (error ?? {}) as SupabaseLikeError;
  const message =
    e?.message ||
    e?.details ||
    e?.hint ||
    fallbackMessage;

  return Object.assign(new Error(message), {
    code: e?.code,
    details: e?.details,
    hint: e?.hint,
  });
};

async function generateNextId(): Promise<string> {
  const supabase = getSupabase();

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
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('vanzari')
    .select('id,id_vanzare,data,client_id,cantitate_kg,pret_lei_kg,status_plata,observatii_ladite,created_at,updated_at,tenant_id')
    .order('data', { ascending: false });

  if (error) {
    console.error('Error fetching vanzari:', error);
    throw error;
  }

  return (data ?? []) as unknown as Vanzare[];
}

export async function createVanzare(input: CreateVanzareInput): Promise<Vanzare> {
  const supabase = getSupabase();
  const nextId = await generateNextId();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payloadWithSync = {
    client_sync_id: input.client_sync_id ?? crypto.randomUUID(),
    id_vanzare: nextId,
    data: input.data,
    client_id: input.client_id || null,
    cantitate_kg: input.cantitate_kg,
    pret_lei_kg: input.pret_lei_kg,
    status_plata: input.status_plata || 'Platit',
    observatii_ladite: input.observatii_ladite || null,
    sync_status: input.sync_status ?? 'synced',
    created_by: user?.id ?? null,
    updated_by: user?.id ?? null,
  };

  const { data, error } = await supabase
    .from('vanzari')
    .upsert(payloadWithSync, { onConflict: 'client_sync_id' })
    .select()
    .single();

  if (!error) {
    return data as unknown as Vanzare;
  }

  if (shouldFallbackToLegacyInsert(error)) {
    const payloadLegacy = {
      id_vanzare: nextId,
      data: input.data,
      client_id: input.client_id || null,
      cantitate_kg: input.cantitate_kg,
      pret_lei_kg: input.pret_lei_kg,
      status_plata: input.status_plata || 'Platit',
      observatii_ladite: input.observatii_ladite || null,
    };

    const { data: fallbackData, error: fallbackError } = await supabase
      .from('vanzari')
      .insert(payloadLegacy)
      .select()
      .single();

    if (fallbackError) {
      console.error('Error creating vanzare (fallback):', {
        message: fallbackError.message,
        code: fallbackError.code,
        details: fallbackError.details,
        hint: fallbackError.hint,
      });
      throw toReadableError(fallbackError, 'Nu am putut salva vanzarea.')
    }

    return fallbackData as unknown as Vanzare;
  }

  const maybeError = error as SupabaseLikeError;
  console.error('Error creating vanzare:', {
    message: maybeError?.message,
    code: maybeError?.code,
    details: maybeError?.details,
    hint: maybeError?.hint,
  });
  throw toReadableError(error, 'Nu am putut salva vanzarea.');

}

export async function updateVanzare(id: string, input: UpdateVanzareInput): Promise<Vanzare> {
  const supabase = getSupabase();

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

  return data as unknown as Vanzare;
}

export async function deleteVanzare(id: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from('vanzari').delete().eq('id', id);

  if (error) {
    console.error('Error deleting vanzare:', error);
    throw error;
  }
}


