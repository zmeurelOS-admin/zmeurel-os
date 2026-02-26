'use client'

import { useEffect } from 'react'
import { getSupabase } from '@/lib/supabase/client'

export function useSentryUser() {
  useEffect(() => {
    const supabase = getSupabase()

    void (async () => {
      try {
        const [{ data }, Sentry] = await Promise.all([
          supabase.auth.getUser(),
          import('@sentry/nextjs'),
        ])

        if (!data?.user) return

        Sentry.setUser({
          id: data.user.id,
          email: data.user.email ?? undefined,
        })
      } catch {
        // monitoring must never affect app runtime
      }
    })()
  }, [])
}
