'use client'

import { createClient } from '@/lib/supabase/client'

type EventMetadata = Record<string, unknown>

interface AnalyticsContext {
  userId: string
  tenantId: string
}

let cachedContext: AnalyticsContext | null = null
let contextPromise: Promise<AnalyticsContext | null> | null = null

async function getAnalyticsContext(): Promise<AnalyticsContext | null> {
  if (cachedContext) return cachedContext
  if (contextPromise) return contextPromise

  contextPromise = (async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle()

      if (!tenant?.id) return null

      cachedContext = { userId: user.id, tenantId: tenant.id }
      return cachedContext
    } catch {
      return null
    } finally {
      contextPromise = null
    }
  })()

  return contextPromise
}

export function trackEvent(eventName: string, metadata: EventMetadata = {}): void {
  if (typeof window === 'undefined') return

  queueMicrotask(() => {
    void (async () => {
      try {
        const context = await getAnalyticsContext()
        if (!context) return

        const supabase = createClient()
        await supabase.from('analytics_events').insert({
          tenant_id: context.tenantId,
          user_id: context.userId,
          event_name: eventName,
          metadata,
        })
      } catch {
        // swallow errors: analytics must never block UX
      }
    })()
  })
}

