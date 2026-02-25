'use client'

import { useQuery } from '@tanstack/react-query'
import {
  CalendarClock,
  Coins,
  MapPinned,
  ShoppingBasket,
  Sprout,
  Tractor,
} from 'lucide-react'

import { AppShell } from '@/components/app/AppShell'
import { AlertCard } from '@/components/app/AlertCard'
import { ErrorState } from '@/components/app/ErrorState'
import { FeatureGate } from '@/components/app/FeatureGate'
import { KpiCard, KpiCardSkeleton } from '@/components/app/KpiCard'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { ProfitSummaryCard } from '@/components/app/ProfitSummaryCard'
import { QuickActionsPanel } from '@/components/app/QuickActionsPanel'
import { generateSmartAlerts } from '@/lib/alerts/engine'
import { getActivitatiAgricole } from '@/lib/supabase/queries/activitati-agricole'
import { getCheltuieli } from '@/lib/supabase/queries/cheltuieli'
import { getParcele } from '@/lib/supabase/queries/parcele'
import { getRecoltari } from '@/lib/supabase/queries/recoltari'
import { getVanzari } from '@/lib/supabase/queries/vanzari'

const PRICE_PER_KG_ESTIMATE = 18
const LABOR_COST_PER_KG = 3

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function DashboardPage() {
  const recoltariQuery = useQuery({
    queryKey: ['dashboard', 'recoltari'],
    queryFn: getRecoltari,
  })

  const parceleQuery = useQuery({
    queryKey: ['dashboard', 'parcele'],
    queryFn: getParcele,
  })

  const activitatiQuery = useQuery({
    queryKey: ['dashboard', 'activitati'],
    queryFn: getActivitatiAgricole,
  })

  const vanzariQuery = useQuery({
    queryKey: ['dashboard', 'vanzari'],
    queryFn: getVanzari,
  })

  const cheltuieliQuery = useQuery({
    queryKey: ['dashboard', 'cheltuieli'],
    queryFn: getCheltuieli,
  })

  const isLoading =
    recoltariQuery.isLoading ||
    parceleQuery.isLoading ||
    activitatiQuery.isLoading ||
    vanzariQuery.isLoading ||
    cheltuieliQuery.isLoading
  const hasError =
    recoltariQuery.isError ||
    parceleQuery.isError ||
    activitatiQuery.isError ||
    vanzariQuery.isError ||
    cheltuieliQuery.isError

  const errorMessage =
    (recoltariQuery.error as Error | null)?.message ||
    (parceleQuery.error as Error | null)?.message ||
    (activitatiQuery.error as Error | null)?.message ||
    (vanzariQuery.error as Error | null)?.message ||
    (cheltuieliQuery.error as Error | null)?.message

  const recoltari = recoltariQuery.data ?? []
  const parcele = parceleQuery.data ?? []
  const activitati = activitatiQuery.data ?? []
  const vanzari = vanzariQuery.data ?? []
  const cheltuieli = cheltuieliQuery.data ?? []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const kgAzi = recoltari
    .filter((r) => {
      const recDate = new Date(r.data)
      recDate.setHours(0, 0, 0, 0)
      return recDate.getTime() === today.getTime()
    })
    .reduce((sum, r) => sum + Number(r.cantitate_kg || 0), 0)

  const venitEstimat = kgAzi * PRICE_PER_KG_ESTIMATE
  const costMunca = kgAzi * LABOR_COST_PER_KG
  const parceleActive = parcele.filter((p) => p.status !== 'anulat').length
  const lucrariProgramate = activitati.filter((a) => {
    if (!a.data_aplicare) return false
    const date = new Date(a.data_aplicare)
    date.setHours(0, 0, 0, 0)
    return date >= today
  }).length

  const seasonStart = new Date(today.getFullYear(), 2, 1)
  seasonStart.setHours(0, 0, 0, 0)
  const seasonEnd = new Date(today)
  seasonEnd.setHours(23, 59, 59, 999)

  const venitSezon = vanzari
    .filter((v) => {
      const date = new Date(v.data)
      return date >= seasonStart && date <= seasonEnd
    })
    .reduce((sum, row) => sum + Number(row.cantitate_kg || 0) * Number(row.pret_lei_kg || 0), 0)

  const costSezon = cheltuieli
    .filter((c) => {
      const date = new Date(c.data)
      return date >= seasonStart && date <= seasonEnd
    })
    .reduce((sum, row) => sum + Number(row.suma_lei || 0), 0)

  const profitSezon = venitSezon - costSezon

  const alerts = generateSmartAlerts({
    today,
    recoltari,
    vanzari,
    cheltuieli,
    activitati,
    parcele: parcele.map((parcela) => ({
      id: parcela.id,
      nume_parcela: parcela.nume_parcela,
    })),
  })

  return (
    <AppShell
      header={
        <PageHeader
          title="Dashboard"
          subtitle="Metrici cheie pentru ziua curenta"
          rightSlot={<Sprout className="h-6 w-6" />}
        />
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-4 py-4">
        {hasError ? <ErrorState title="Eroare dashboard" message={errorMessage ?? 'Nu am putut incarca datele.'} /> : null}
        {isLoading ? <LoadingState label="Se incarca metricile..." /> : null}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => <KpiCardSkeleton key={index} />)
            : (
              <>
                <KpiCard
                  title="Kg azi"
                  value={`${kgAzi.toFixed(1)} kg`}
                  subtitle="Cules inregistrat azi"
                  trend={kgAzi > 0 ? 'up' : 'neutral'}
                  icon={<ShoppingBasket className="h-5 w-5" />}
                />
                <KpiCard
                  title="Venit estimat"
                  value={formatCurrency(venitEstimat)}
                  subtitle={`Estimare la ${PRICE_PER_KG_ESTIMATE} lei/kg`}
                  trend={venitEstimat > 0 ? 'up' : 'neutral'}
                  icon={<Coins className="h-5 w-5" />}
                />
                <KpiCard
                  title="Cost munca"
                  value={formatCurrency(costMunca)}
                  subtitle={`Estimare la ${LABOR_COST_PER_KG} lei/kg`}
                  trend={costMunca > 0 ? 'down' : 'neutral'}
                  icon={<Tractor className="h-5 w-5" />}
                />
                <KpiCard
                  title="Parcele active"
                  value={parceleActive}
                  subtitle={`${parcele.length} parcele in total`}
                  trend="neutral"
                  icon={<MapPinned className="h-5 w-5" />}
                />
                <KpiCard
                  title="Lucrari programate"
                  value={lucrariProgramate}
                  subtitle="Azi si zilele urmatoare"
                  trend={lucrariProgramate > 0 ? 'up' : 'neutral'}
                  icon={<CalendarClock className="h-5 w-5" />}
                />
                <KpiCard
                  title="Profit sezon"
                  value={formatCurrency(profitSezon)}
                  subtitle="Venit - cost sezon curent"
                  trend={profitSezon >= 0 ? 'up' : 'down'}
                  icon={<Coins className="h-5 w-5" />}
                />
              </>
            )}
        </section>

        {!isLoading ? (
          <ProfitSummaryCard
            title="Profit sezon"
            subtitle="Sezon curent (martie - prezent)"
            revenue={venitSezon}
            cost={costSezon}
          />
        ) : null}

        {!isLoading ? (
          <FeatureGate
            feature="smart_alerts"
            title="Smart Alerts este disponibil in Pro+"
            message="Activeaza Pro pentru alerta automata la riscuri operationale."
          >
            <section className="agri-card space-y-3 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[var(--agri-text)]">Smart Alerts</h3>
                <span className="rounded-full bg-[var(--agri-surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--agri-text-muted)]">
                  {alerts.length}
                </span>
              </div>

              {alerts.length === 0 ? (
                <p className="text-sm font-medium text-[var(--agri-text-muted)]">Nu exista alerte active.</p>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </section>
          </FeatureGate>
        ) : null}

        <QuickActionsPanel />
      </div>
    </AppShell>
  )
}
