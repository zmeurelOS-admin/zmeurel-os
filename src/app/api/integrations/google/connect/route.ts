import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { requireGoogleContactsAdmin } from '@/lib/integrations/googleContactsAuth'

export const runtime = 'nodejs'

function buildGoogleOauthUrl(origin: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/integrations/google/callback`

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is missing')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    scope: 'openid email https://www.googleapis.com/auth/contacts.readonly',
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function GET(request: Request) {
  try {
    await requireGoogleContactsAdmin()
    const cookieStore = await cookies()
    const state = crypto.randomUUID()
    cookieStore.set('gc_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 10,
    })

    const url = new URL(request.url)
    const origin = process.env.APP_BASE_URL || url.origin
    return NextResponse.redirect(buildGoogleOauthUrl(origin, state))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden'
    const status = message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
