import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import {
  captureIntegrationError,
  safeTrackSyncEvent,
  syncContacts,
} from '@/lib/integrations/googleContacts'

export const runtime = 'nodejs'

function hasValidCronSecret(request: Request): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false

  const headerSecret = request.headers.get('x-cron-secret')
  const bearer = request.headers.get('authorization')
  const bearerSecret = bearer?.startsWith('Bearer ') ? bearer.slice(7) : null

  return headerSecret === expected || bearerSecret === expected
}

export async function GET(request: Request) {
  if (!hasValidCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: superadminProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_superadmin', true)

    if (profilesError) throw profilesError
    const superadminIds = (superadminProfiles ?? []).map((row) => row.id)
    if (superadminIds.length === 0) {
      return NextResponse.json({ ok: true, message: 'No superadmin profile found' })
    }

    const { data: integration, error: integrationError } = await supabase
      .from('integrations_google_contacts')
      .select('*')
      .in('user_id', superadminIds)
      .eq('sync_enabled', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (integrationError) throw integrationError
    if (!integration) {
      return NextResponse.json({ ok: true, message: 'No active admin integration found' })
    }

    await safeTrackSyncEvent({
      supabase,
      tenantId: integration.tenant_id,
      userId: integration.user_id,
      event: 'google_contacts_sync_started',
      metadata: { source: 'cron', sync_window: integration.sync_window },
    })

    const result = await syncContacts({
      supabase,
      integration,
      forceFullSync: false,
    })

    await safeTrackSyncEvent({
      supabase,
      tenantId: integration.tenant_id,
      userId: integration.user_id,
      event: 'google_contacts_sync_completed',
      metadata: { ...result, source: 'cron' },
    })

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    await captureIntegrationError(error, { route: 'google_contacts_cron' })

    try {
      const supabase = getSupabaseAdmin()
      const { data: superadminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_superadmin', true)
      const superadminIds = (superadminProfiles ?? []).map((row) => row.id)
      const { data: integration } = await supabase
        .from('integrations_google_contacts')
        .select('tenant_id,user_id')
        .in('user_id', superadminIds)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (integration?.tenant_id && integration?.user_id) {
        await safeTrackSyncEvent({
          supabase,
          tenantId: integration.tenant_id,
          userId: integration.user_id,
          event: 'google_contacts_sync_failed',
          metadata: { source: 'cron', message: error instanceof Error ? error.message : 'unknown_error' },
        })
      }
    } catch {
      // ignore secondary errors
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cron sync failed' },
      { status: 500 }
    )
  }
}
