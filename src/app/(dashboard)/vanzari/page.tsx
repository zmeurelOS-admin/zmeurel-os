// src/app/(dashboard)/vanzari/page.tsx
import { createClient } from '@/lib/supabase/server';
import { VanzariPageClient } from './VanzariPageClient';
import type { Vanzare } from '@/lib/supabase/queries/vanzari';

export default async function VanzariPage() {
  const supabase = await createClient();

  // RLS handles tenant isolation automatically - no manual auth check needed (middleware handles it)
  const { data: vanzari = [] } = await supabase
    .from('vanzari')
    .select('id,id_vanzare,data,client_id,cantitate_kg,pret_lei_kg,status_plata,observatii_ladite,created_at,updated_at,tenant_id')
    .order('data', { ascending: false });

  const { data: clienti = [] } = await supabase
    .from('clienti')
    .select('id, nume_client')
    .order('created_at', { ascending: false });

  // Map to Client interface expected by VanzariPageClient
  const mappedClienti = (clienti || []).map(c => ({
    id: c.id,
    nume: c.nume_client
  }));

  return (
    <VanzariPageClient
      initialVanzari={(vanzari ?? []) as unknown as Vanzare[]}
      clienti={mappedClienti}
    />
  );
}

