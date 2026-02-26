import { NextResponse } from 'next/server'
import {
  captureIntegrationError,
  safeTrackSyncEvent,
  syncContacts,
} from '@/lib/integrations/googleContacts'
import { requireGoogleContactsAdmin } from '@/lib/integrations/googleContactsAuth'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const auth = await requireGoogleContactsAdmin()

    const { data, error } = await auth.supabase
      .from('integrations_google_contacts')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({
      connected: Boolean(data?.access_token || data?.refresh_token),
      connected_email: data?.connected_email ?? null,
      last_sync_at: data?.last_sync_at ?? null,
      sync_enabled: data?.sync_enabled ?? true,
      sync_window: data?.sync_window ?? 'seara',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden'
    const status = message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireGoogleContactsAdmin()
    const body = (await request.json()) as { sync_enabled?: boolean; sync_window?: 'dimineata' | 'seara' }

    const payload: Record<string, unknown> = {}
    if (typeof body.sync_enabled === 'boolean') payload.sync_enabled = body.sync_enabled
    if (body.sync_window === 'dimineata' || body.sync_window === 'seara') payload.sync_window = body.sync_window

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'No payload' }, { status: 400 })
    }

    const { error } = await auth.supabase
      .from('integrations_google_contacts')
      .update(payload)
      .eq('user_id', auth.userId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden'
    const status = message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST() {
  try {
    const auth = await requireGoogleContactsAdmin()
    const { data: integration, error: integrationError } = await auth.supabase
      .from('integrations_google_contacts')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle()

    if (integrationError) throw integrationError
    if (!integration) {
      return NextResponse.json({ error: 'Google integration not connected' }, { status: 400 })
    }

    await safeTrackSyncEvent({
      supabase: auth.supabase,
      tenantId: auth.tenantId,
      userId: auth.userId,
      event: 'google_contacts_import_started',
      metadata: { source: 'manual' },
    })
    await safeTrackSyncEvent({
      supabase: auth.supabase,
      tenantId: auth.tenantId,
      userId: auth.userId,
      event: 'google_contacts_sync_started',
      metadata: { source: 'manual' },
    })

    const result = await syncContacts({
      supabase: auth.supabase,
      integration,
      forceFullSync: false,
    })

    await safeTrackSyncEvent({
      supabase: auth.supabase,
      tenantId: auth.tenantId,
      userId: auth.userId,
      event: 'google_contacts_import_completed',
      metadata: result as unknown as Record<string, unknown>,
    })

    await safeTrackSyncEvent({
      supabase: auth.supabase,
      tenantId: auth.tenantId,
      userId: auth.userId,
      event: 'google_contacts_sync_completed',
      metadata: { ...result, source: 'manual' },
    })

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    await captureIntegrationError(error, { route: 'google_import_manual' })
    try {
      const auth = await requireGoogleContactsAdmin()
      await safeTrackSyncEvent({
        supabase: auth.supabase,
        tenantId: auth.tenantId,
        userId: auth.userId,
        event: 'google_contacts_sync_failed',
        metadata: { source: 'manual', message: error instanceof Error ? error.message : 'unknown_error' },
      })
    } catch {
      // do nothing
    }

    const message = error instanceof Error ? error.message : 'Import failed'
    const status = message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
