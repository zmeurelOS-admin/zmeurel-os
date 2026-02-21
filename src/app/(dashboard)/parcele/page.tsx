import { getParcele } from '@/lib/supabase/queries/parcele';
import { ParcelaPageClient } from './ParcelaPageClient';

export default async function ParcelePage() {
  const parcele = await getParcele();

  return <ParcelaPageClient initialParcele={parcele || []} />;
}
