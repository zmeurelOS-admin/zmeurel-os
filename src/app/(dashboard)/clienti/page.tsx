// src/app/(dashboard)/clienti/page.tsx
import { createClient } from '@/lib/supabase/server';
import { ClientPageClient } from './ClientPageClient';

export const metadata = {
  title: 'ClienČ›i | Zmeurel OS',
  description: 'GestioneazÄ baza de clienČ›i',
};

export default async function ClientPage() {
  const supabase = await createClient();

  // RLS handles tenant isolation automatically - no manual auth check needed (middleware handles it)
  const { data: clienti } = await supabase
    .from('clienti')
    .select('id,id_client,nume_client,telefon,email,adresa,pret_negociat_lei_kg,observatii,google_resource_name,google_etag,created_at,updated_at,tenant_id')
    .order('created_at', { ascending: false });

  return <ClientPageClient initialClienti={clienti || []} />;
}

