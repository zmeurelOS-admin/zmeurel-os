import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function clearStaleSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  const authCookieRegex = /^sb-.*-auth-token(?:\.\d+)?$/
  const codeVerifierRegex = /^sb-.*-auth-token-code-verifier$/

  request.cookies.getAll().forEach(({ name }) => {
    if (!authCookieRegex.test(name) && !codeVerifierRegex.test(name)) {
      return
    }

    request.cookies.delete(name)
    response.cookies.delete(name)
  })
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Public routes that should NOT require authentication
  const isPublicRoute =
    pathname === '/login' ||
    pathname === '/callback' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/update-password') ||
    pathname.startsWith('/api/cron/google-contacts-sync')

  // Get the current user session
  let user = null
  let authErrorCode: string | null = null

  try {
    const {
      data: { user: currentUser },
      error,
    } = await supabase.auth.getUser()

    user = currentUser
    authErrorCode = (error as { code?: string } | null)?.code ?? null
  } catch (error) {
    authErrorCode = (error as { code?: string } | null)?.code ?? null
  }

  if (authErrorCode === 'refresh_token_not_found') {
    clearStaleSupabaseAuthCookies(request, supabaseResponse)
    user = null
  }

  // If user is NOT authenticated
  if (!user) {
    // Allow access to public routes
    if (isPublicRoute) {
      return supabaseResponse
    }
    
    // Redirect to login for protected routes
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // If user IS authenticated and trying to access auth entry pages, redirect to dashboard
  if (user && (pathname === '/login' || pathname === '/reset-password-request')) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // User is authenticated, allow access to protected routes
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

