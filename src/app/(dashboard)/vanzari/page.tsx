// src/app/(dashboard)/vanzari/page.tsx
import { createClient } from '@/lib/supabase/server';
import { VanzariPageClient } from './VanzariPageClient';

export default async function VanzariPage() {
  const supabase = await createClient();

  // RLS handles tenant isolation automatically - no manual auth check needed (middleware handles it)
  const { data: vanzari = [] } = await supabase
    .from('vanzari')
    .select('*')
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
      initialVanzari={vanzari || []}
      clienti={mappedClienti}
    />
  );
}
