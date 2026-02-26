'use client'

import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Check, Crown, Rocket, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { AppShell } from '@/components/app/AppShell'
import { PageHeader } from '@/components/app/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics/trackEvent'
import { isSuperAdmin } from '@/lib/auth/isSuperAdmin'
import { PLAN_LABELS, PLAN_LIMITS, PLAN_PRICING, type SubscriptionPlan } from '@/lib/subscription/plans'
import { useMockPlan } from '@/lib/subscription/useMockPlan'
import { getSupabase } from '@/lib/supabase/client'

interface PlanCardConfig {
  id: SubscriptionPlan
  title: string
  subtitle: string
  price: string
  features: string[]
  icon: ComponentType<{ className?: string }>
}

const planCards: PlanCardConfig[] = [
  {
    id: 'freemium',
    title: 'Ideal pentru început',
    subtitle: 'Start simplu pentru ferme mici',
    price: PLAN_PRICING.freemium,
    features: ['1 parcelă', 'Evidență recoltări și vânzări', 'Rapoarte standard', 'Stoc de bază'],
    icon: ShieldCheck,
  },
  {
    id: 'pro',
    title: 'Control comercial complet',
    subtitle: 'Optimizat pentru crestere rapida',
    price: PLAN_PRICING.pro,
    features: ['Parcele nelimitate', 'Smart Alerts', 'Rapoarte avansate', 'Export sezon complet', 'Backup automat'],
    icon: Rocket,
  },
  {
    id: 'enterprise',
    title: 'Scalare pentru operațiuni extinse',
    subtitle: 'Potrivit pentru echipe și fluxuri complexe',
    price: PLAN_PRICING.enterprise,
    features: ['Tot din Pro', 'Multi-utilizator', 'Suport prioritar', 'Onboarding dedicat', 'Personalizare fluxuri'],
    icon: Crown,
  },
]

export default function PlanuriPage() {
  const { plan, setPlan, source } = useMockPlan()
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)

  useEffect(() => {
    void (async () => {
      const supabase = getSupabase()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsSuperAdminUser(user?.id ? await isSuperAdmin(supabase, user.id) : false)
    })()
  }, [])

  const handleSelectPlan = (targetPlan: SubscriptionPlan) => {
    if (!isSuperAdminUser) {
      toast.error('Doar superadmin poate modifica planul fermei.')
      return
    }

    if (source === 'fallback') {
      toast.error('Nu am putut identifica ferma curenta pentru actualizarea planului.')
      return
    }

    if (targetPlan !== plan) {
      trackEvent('upgrade_plan_click', {
        source: 'PlanuriPage',
        targetPlan,
        currentPlan: plan,
      })
    }

    setPlan(targetPlan)
  }

  return (
    <AppShell header={<PageHeader title="Planuri" subtitle="Abonamente Zmeurel OS" />}>
      <div className="mx-auto w-full max-w-6xl space-y-8 py-6 md:space-y-6 md:py-4">
        <section className="agri-card rounded-2xl p-6 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-[var(--agri-text)] sm:text-3xl">
              Planuri simple. Scalare fără limite.
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--agri-text-muted)] sm:text-base">
              Zmeurel OS crește odată cu ferma ta - de la primele parcele până la operațiuni comerciale complexe.
            </p>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span>Plan activ pentru această fermă:</span>
            <span>{PLAN_LABELS[plan]}</span>
          </div>
        </section>

        <section className="mt-6 mb-6 grid grid-cols-1 gap-6 md:mt-0 md:mb-0 md:grid-cols-3 md:gap-4">
          {planCards.map((item) => {
            const isCurrent = plan === item.id
            const Icon = item.icon
            const parcelLimit = PLAN_LIMITS[item.id].maxParcels

            const cardClassName =
              item.id === 'pro'
                ? 'rounded-2xl border border-green-500/40 bg-white p-6 shadow-md transition-transform duration-150 ease-out active:scale-[0.98] md:hover:scale-[1.03] md:active:scale-100'
                : 'rounded-2xl border border-[var(--agri-border)] bg-white p-6 shadow-sm transition-transform duration-150 ease-out active:scale-[0.98] md:hover:scale-[1.03] md:active:scale-100'

            return (
              <article key={item.id} className={cardClassName}>
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--agri-text-muted)]">{PLAN_LABELS[item.id]}</p>
                    <h2 className="text-lg font-bold text-[var(--agri-text)]">{item.title}</h2>
                    <p className="text-sm text-[var(--agri-text-muted)]">{item.subtitle}</p>
                  </div>

                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--agri-surface-muted)] text-[var(--agri-text)]">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                {item.id === 'pro' ? (
                  <Badge className="mb-3 inline-flex border-emerald-200 bg-emerald-100 text-emerald-800">Cel mai popular</Badge>
                ) : null}

                <p className="mb-4 text-3xl font-black text-[var(--agri-text)]">{item.price}</p>

                <ul className="space-y-2">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm font-medium text-[var(--agri-text)]">
                      <Check className="h-4 w-4 text-emerald-700" />
                      {feature}
                    </li>
                  ))}
                  {parcelLimit === null ? null : (
                    <li className="flex items-center gap-2 text-sm font-medium text-[var(--agri-text)]">
                      <Check className="h-4 w-4 text-emerald-700" />
                      Limita creare parcele: {parcelLimit}
                    </li>
                  )}
                </ul>

                <div className="mt-6 space-y-2">
                  {item.id === 'freemium' ? (
                    <>
                      <Button
                        type="button"
                        className="agri-cta h-11 w-full text-base"
                        variant={isCurrent ? 'outline' : 'default'}
                        disabled={isCurrent || !isSuperAdminUser}
                        onClick={() => handleSelectPlan('freemium')}
                      >
                        {isCurrent ? 'Plan curent' : 'Alege Freemium'}
                      </Button>
                      {isCurrent ? (
                        <p className="text-center text-xs font-medium text-[var(--agri-text-muted)]">Plan activ pentru această fermă</p>
                      ) : null}
                    </>
                  ) : null}

                  {item.id === 'pro' ? (
                    <Button
                      type="button"
                      className="agri-cta h-11 w-full text-base bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
                      disabled={isCurrent || !isSuperAdminUser}
                      onClick={() => handleSelectPlan('pro')}
                    >
                      {isCurrent ? 'Plan curent' : 'Upgrade la Pro'}
                    </Button>
                  ) : null}

                  {item.id === 'enterprise' ? (
                    <Button
                      type="button"
                      className="agri-cta h-11 w-full text-base bg-slate-900 text-white hover:bg-slate-800"
                      onClick={() => {
                        trackEvent('upgrade_plan_click', {
                          source: 'PlanuriPage',
                          targetPlan: 'enterprise',
                          currentPlan: plan,
                        })
                        window.location.href = 'mailto:contact@zmeurelos.ro?subject=Plan%20Enterprise%20Zmeurel%20OS'
                      }}
                    >
                      Contactează-ne
                    </Button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </section>

        {!isSuperAdminUser ? (
          <p className="text-center text-sm font-medium text-[var(--agri-text-muted)]">
            Doar superadmin poate edita planul. Pentru utilizatori standard pagina este doar informativa.
          </p>
        ) : null}
      </div>
    </AppShell>
  )
}
