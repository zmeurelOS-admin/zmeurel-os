import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

async function ensureTenantForUser(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; user_metadata?: Record<string, unknown> | null }
) {
  const { data: existingTenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_user_id', user.id)
    .maybeSingle()

  if (existingTenant?.id) return

  const farmNameRaw = user.user_metadata?.farm_name
  const farmName = typeof farmNameRaw === 'string' && farmNameRaw.trim().length > 0 ? farmNameRaw.trim() : 'Ferma mea'

  await supabase.from('tenants').insert({
    nume_ferma: farmName,
    owner_user_id: user.id,
  })
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'recovery' | 'email' | 'signup',
    })

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && (type === 'email' || type === 'signup')) {
        await ensureTenantForUser(supabase, user)
      }

      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`)
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await ensureTenantForUser(supabase, user)
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}


