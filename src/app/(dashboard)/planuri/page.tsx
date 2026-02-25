'use client'

import type { ComponentType } from 'react'
import { Check, Crown, Rocket, ShieldCheck } from 'lucide-react'

import { AppShell } from '@/components/app/AppShell'
import { PageHeader } from '@/components/app/PageHeader'
import { Button } from '@/components/ui/button'
import { PLAN_LABELS, type SubscriptionPlan } from '@/lib/subscription/plans'
import { useMockPlan } from '@/lib/subscription/useMockPlan'
import { trackEvent } from '@/lib/analytics/trackEvent'

const plans: Array<{
  id: SubscriptionPlan
  price: string
  subtitle: string
  features: string[]
  icon: ComponentType<{ className?: string }>
}> = [
  {
    id: 'basic',
    price: '49 lei / luna',
    subtitle: 'Evidenta operationala esentiala',
    features: [
      'Dashboard de baza',
      'Parcele, recoltari, vanzari',
      'Rapoarte standard',
    ],
    icon: ShieldCheck,
  },
  {
    id: 'pro',
    price: '129 lei / luna',
    subtitle: 'Control comercial complet',
    features: [
      'Smart Alerts',
      'Rapoarte avansate',
      'Export sezon complet',
    ],
    icon: Rocket,
  },
  {
    id: 'enterprise',
    price: 'Personalizat',
    subtitle: 'Scalare pentru operatiuni extinse',
    features: [
      'Tot din Pro',
      'Suport prioritar',
      'Onboarding dedicat',
    ],
    icon: Crown,
  },
]

export default function PlanuriPage() {
  const { plan, setPlan } = useMockPlan()

  return (
    <AppShell
      header={
        <PageHeader
          title="Planuri abonament"
          subtitle="Infrastructura UI pentru monetizare pe abonament"
        />
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-4 py-4">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((item) => {
            const active = plan === item.id
            const Icon = item.icon

            return (
              <article
                key={item.id}
                className={`agri-card p-5 ${active ? 'border-emerald-600 bg-emerald-50' : ''}`}
              >
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--agri-text)]">{PLAN_LABELS[item.id]}</h2>
                    <p className="text-sm font-medium text-[var(--agri-text-muted)]">{item.subtitle}</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--agri-surface-muted)] text-[var(--agri-text)]">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                <p className="mb-4 text-2xl font-black text-[var(--agri-text)]">{item.price}</p>

                <ul className="mb-5 space-y-2">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm font-medium text-[var(--agri-text)]">
                      <Check className="h-4 w-4 text-emerald-700" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  type="button"
                  onClick={() => {
                    if (!active) {
                      trackEvent('upgrade_plan_click', {
                        source: 'PlanuriPage',
                        targetPlan: item.id,
                        currentPlan: plan,
                      })
                    }
                    setPlan(item.id)
                  }}
                  className={`agri-cta w-full ${
                    active
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                      : 'bg-[var(--agri-primary)] text-white hover:bg-emerald-700'
                  }`}
                >
                  {active ? 'Plan activ' : `Activeaza ${PLAN_LABELS[item.id]}`}
                </Button>
              </article>
            )
          })}
        </section>
      </div>
    </AppShell>
  )
}
