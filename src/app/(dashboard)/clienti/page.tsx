// src/app/(dashboard)/clienti/page.tsx
import { createClient } from '@/lib/supabase/server';
import { ClientPageClient } from './ClientPageClient';

export const metadata = {
  title: 'Clienți | Zmeurel OS',
  description: 'Gestionează baza de clienți',
};

export default async function ClientPage() {
  const supabase = await createClient();

  // RLS handles tenant isolation automatically - no manual auth check needed (middleware handles it)
  const { data: clienti } = await supabase
    .from('clienti')
    .select('*')
    .order('created_at', { ascending: false });

  return <ClientPageClient initialClienti={clienti || []} />;
}
