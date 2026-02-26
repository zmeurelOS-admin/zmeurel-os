'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { normalizeSubscriptionPlan, type SubscriptionPlan } from '@/lib/subscription/plans'
import { getSupabase } from '@/lib/supabase/client'

type PlanSource = 'tenant' | 'fallback'

interface TenantPlanResult {
  plan: SubscriptionPlan
  tenantId: string | null
  source: PlanSource
}

async function fetchTenantPlan(): Promise<TenantPlanResult> {
  const supabase = getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    return {
      plan: 'freemium',
      tenantId: null,
      source: 'fallback',
    }
  }

  const { data, error } = await supabase
    .from('tenants')
    .select('id,plan')
    .eq('owner_user_id', user.id)
    .maybeSingle()

  if (error || !data?.id) {
    return {
      plan: 'freemium',
      tenantId: null,
      source: 'fallback',
    }
  }

  return {
    plan: normalizeSubscriptionPlan(data.plan) ?? 'freemium',
    tenantId: data.id,
    source: 'tenant',
  }
}

export function useMockPlan() {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['subscription-plan', 'tenant'],
    queryFn: fetchTenantPlan,
    staleTime: 60_000,
  })

  const plan = data?.plan ?? 'freemium'
  const source: PlanSource = data?.source ?? 'fallback'

  const updatePlan = (nextPlan: SubscriptionPlan) => {
    void (async () => {
      const tenantId = data?.tenantId
      if (!tenantId) {
        return
      }

      const supabase = getSupabase()
      const { error } = await supabase
        .from('tenants')
        .update({ plan: nextPlan })
        .eq('id', tenantId)

      if (!error) {
        await queryClient.invalidateQueries({ queryKey: ['subscription-plan', 'tenant'] })
      }
    })()
  }

  return { plan, setPlan: updatePlan, source }
}

