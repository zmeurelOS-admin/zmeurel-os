import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import {
  captureIntegrationError,
  exchangeGoogleCodeForTokens,
  safeTrackSyncEvent,
  upsertGoogleIntegration,
} from '@/lib/integrations/googleContacts'
import { requireGoogleContactsAdmin } from '@/lib/integrations/googleContactsAuth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const origin = process.env.APP_BASE_URL || url.origin

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/settings?google_contacts=error_missing_code`)
  }

  try {
    const cookieStore = await cookies()
    const savedState = cookieStore.get('gc_oauth_state')?.value
    cookieStore.delete('gc_oauth_state')

    if (!savedState || savedState !== state) {
      return NextResponse.redirect(`${origin}/settings?google_contacts=error_state`)
    }

    const auth = await requireGoogleContactsAdmin()
    const tokenData = await exchangeGoogleCodeForTokens(code)
    const integration = await upsertGoogleIntegration({
      supabase: auth.supabase,
      tenantId: auth.tenantId,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tokenData,
    })

    await safeTrackSyncEvent({
      supabase: auth.supabase,
      tenantId: auth.tenantId,
      userId: auth.userId,
      event: 'google_contacts_connected',
      metadata: {
        connected_email: integration.connected_email,
        has_refresh_token: Boolean(integration.refresh_token),
      },
    })

    return NextResponse.redirect(`${origin}/settings?google_contacts=connected`)
  } catch (error) {
    await captureIntegrationError(error, { route: 'google_callback' })
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.redirect(`${origin}/settings?google_contacts=error`)
  }
}
