import { createClient } from '@/lib/supabase/server';
import { CheltuialaPageClient } from './CheltuialaPageClient';

export default async function CheltuieliPage() {
  const supabase = await createClient();

  // RLS handles tenant isolation automatically
  const { data: cheltuieli, error } = await supabase
    .from('cheltuieli_diverse')
    .select('*')
    .order('data', { ascending: false });

  // Nu aruncăm UI changes; doar protejăm de undefined
  if (error) {
    // Poți loga în server logs dacă vrei
    // console.error(error);
  }

  return <CheltuialaPageClient initialCheltuieli={cheltuieli || []} />;
}