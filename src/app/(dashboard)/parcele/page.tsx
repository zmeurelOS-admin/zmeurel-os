import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ParcelaPageClient from './ParcelaPageClient';

export const dynamic = 'force-dynamic';

export default async function ParcelePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // ✅ Preia tenant_id dinamic din baza de date
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();

  if (tenantError || !tenant) {
    console.error('Tenant negasit:', tenantError);
    redirect('/login');
  }

  const tenantId = tenant.id;

  const { data: parcele, error: parceleError } = await supabase
    .from('parcele')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('id_parcela', { ascending: true });

  if (parceleError) {
    console.error('Error parcele:', parceleError);
  }

  const { data: soiuriData } = await supabase
    .from('nomenclatoare')
    .select('valoare')
    .eq('tip', 'Soi')
    .order('valoare', { ascending: true });

  const soiuriDisponibile = soiuriData?.map((item) => item.valoare) || [];

  return (
    <ParcelaPageClient
      tenantId={tenantId}
      initialParcele={parcele || []}
      soiuriDisponibile={soiuriDisponibile}
    />
  );
}
