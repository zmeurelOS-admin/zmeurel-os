import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  return NextResponse.redirect(`${url.origin}/auth/callback${url.search}`)
}

