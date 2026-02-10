import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Verifică dacă există cookie de sesiune Supabase
  // Cookie-ul are formatul: sb-{PROJECT_ID}-auth-token
  const supabaseToken = req.cookies.get('sb-ilybohhdeplwcrbpblqw-auth-token');
  const hasSession = !!supabaseToken;

  // Pagini publice (nu necesită autentificare)
  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname === path);

  // Dacă userul NU e autentificat și încearcă să acceseze pagini protejate
  if (!hasSession && !isPublicPath) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Dacă userul E autentificat și încearcă să acceseze /login sau /register
  if (hasSession && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/test';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Configurează ce rute să fie verificate de middleware
export const config = {
  matcher: [
    /*
     * Match toate rutele EXCEPTÂND:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};