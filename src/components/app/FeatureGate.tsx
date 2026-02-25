'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { hasFeature, PLAN_LABELS, type SubscriptionFeature } from '@/lib/subscription/plans'
import { useMockPlan } from '@/lib/subscription/useMockPlan'
import { trackEvent } from '@/lib/analytics/trackEvent'

interface FeatureGateProps {
  feature: SubscriptionFeature
  title?: string
  message?: string
  children: React.ReactNode
}

export function FeatureGate({
  feature,
  title = 'Feature disponibila in plan superior',
  message = 'Upgrade la Pro pentru acces complet.',
  children,
}: FeatureGateProps) {
  const { plan } = useMockPlan()
  const allowed = hasFeature(plan, feature)

  if (allowed) return <>{children}</>

  return (
    <div className="agri-card border-amber-400 bg-amber-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
          <Lock className="h-5 w-5" />
        </span>
        <div className="space-y-2">
          <p className="text-base font-bold text-amber-900">{title}</p>
          <p className="text-sm font-medium text-amber-800">
            {message} Plan curent: <strong>{PLAN_LABELS[plan]}</strong>.
          </p>
          <Button asChild className="agri-cta bg-[var(--agri-primary)] text-white hover:bg-emerald-700">
            <Link
              href="/planuri"
              onClick={() => {
                trackEvent('upgrade_plan_click', { source: 'FeatureGate', feature })
              }}
            >
              Upgrade plan
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
