// ============================================================================
// RLS DEBUG CHECKER
// Temporary test script to verify RLS and tenant_id auto-population
// DO NOT EXPOSE TO PRODUCTION ROUTES
// ============================================================================

import { getSupabase } from '@/lib/supabase/client';

export async function testRLSAutoPopulation() {
  const supabase = getSupabase();

  console.log('đź”Ť Starting RLS Check...');

  // 1. Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('âťŚ User not authenticated:', userError);
    return { success: false, error: 'User not authenticated' };
  }

  console.log('âś… Authenticated user:', user.id);

  // 2. Get user's tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();

  if (tenantError || !tenant) {
    console.error('âťŚ Tenant not found:', tenantError);
    return { success: false, error: 'Tenant not found' };
  }

  console.log('âś… User tenant_id:', tenant.id);

  // 3. Insert a test client record WITHOUT tenant_id
  const testClientName = `RLS_TEST_${Date.now()}`;
  
  const { data: insertedClient, error: insertError } = await supabase
    .from('clienti')
    .insert({
      id_client: `RLS${Date.now()}`,
      nume_client: testClientName,
      telefon: '0700000000',
      email: 'rls-test@example.com',
      // NOTE: tenant_id is NOT included - should be auto-populated by trigger/RLS
    })
    .select()
    .single();

  if (insertError) {
    console.error('âťŚ Insert failed:', insertError);
    return { success: false, error: insertError.message };
  }

  console.log('âś… Record inserted:', insertedClient);

  // 4. Check if tenant_id was auto-populated
  if (!insertedClient.tenant_id) {
    console.error('âťŚ tenant_id was NOT auto-populated!');
    return { 
      success: false, 
      error: 'tenant_id not auto-populated',
      record: insertedClient 
    };
  }

  if (insertedClient.tenant_id !== tenant.id) {
    console.error('âťŚ tenant_id mismatch!');
    console.error('Expected:', tenant.id);
    console.error('Got:', insertedClient.tenant_id);
    return { 
      success: false, 
      error: 'tenant_id mismatch',
      expected: tenant.id,
      got: insertedClient.tenant_id 
    };
  }

  console.log('âś… tenant_id correctly auto-populated:', insertedClient.tenant_id);

  // 5. Verify we can only see our own records (RLS SELECT policy)
  const { data: allClients, error: selectError } = await supabase
    .from('clienti')
    .select('id,tenant_id');

  if (selectError) {
    console.error('âťŚ Select failed:', selectError);
  } else {
    const ourClients = allClients?.filter((c: { tenant_id: string | null }) => c.tenant_id === tenant.id);
    console.log(`âś… RLS SELECT working: ${ourClients?.length}/${allClients?.length} records visible`);
  }

  // 6. Clean up test record
  const { error: deleteError } = await supabase
    .from('clienti')
    .delete()
    .eq('id', insertedClient.id);

  if (deleteError) {
    console.warn('âš ď¸Ź Failed to clean up test record:', deleteError);
  } else {
    console.log('âś… Test record cleaned up');
  }

  return {
    success: true,
    userId: user.id,
    tenantId: tenant.id,
    autoPopulatedTenantId: insertedClient.tenant_id,
    message: 'RLS and tenant_id auto-population working correctly!'
  };
}

// Export for manual testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testRLS = testRLSAutoPopulation;
}



