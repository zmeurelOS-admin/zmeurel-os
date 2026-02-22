import { createClient } from '@/lib/supabase/server';
import { ParcelaPageClient } from './ParcelaPageClient';

export default async function ParcelePage() {
  const supabase = await createClient();

  // RLS handles tenant isolation automatically
  const { data: parcele } = await supabase
    .from('parcele')
    .select('*')
    .order('created_at', { ascending: false });

  return <ParcelaPageClient initialParcele={parcele || []} />;
}
