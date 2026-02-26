'use client'

import { getSupabase } from '@/lib/supabase/client'

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
      const supabase = getSupabase()
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

export function trackEvent(eventType: string, module: string, metadata?: EventMetadata): void
export function trackEvent(eventType: string, metadata?: EventMetadata): void
export function trackEvent(
  eventType: string,
  moduleOrMetadata: string | EventMetadata = 'general',
  metadata: EventMetadata = {}
): void {
  if (typeof window === 'undefined') return

  const module = typeof moduleOrMetadata === 'string' ? moduleOrMetadata : 'general'
  const payloadMetadata = typeof moduleOrMetadata === 'string' ? metadata : moduleOrMetadata

  queueMicrotask(() => {
    void (async () => {
      try {
        const context = await getAnalyticsContext()
        if (!context) return

        const supabase = getSupabase()
        await (supabase as any).from('analytics_events').insert({
          tenant_id: context.tenantId,
          user_id: context.userId,
          event_name: eventType,
          event_type: eventType,
          module,
          metadata: payloadMetadata ?? {},
        })
      } catch {
        // swallow errors: analytics must never block UX
      }
    })()
  })
}



