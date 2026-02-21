import { getCheltuieli } from '@/lib/supabase/queries/cheltuieli';
import { CheltuialaPageClient } from './CheltuialaPageClient';

export default async function CheltuieliPage() {
  const cheltuieli = await getCheltuieli();

  return (
    <CheltuialaPageClient
      initialCheltuieli={cheltuieli || []}
    />
  );
}
