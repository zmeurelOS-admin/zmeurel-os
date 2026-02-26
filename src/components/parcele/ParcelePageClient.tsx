'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Map as MapIcon } from 'lucide-react'
import { toast } from 'sonner'

import { AppDialog } from '@/components/app/AppDialog'
import { ProfitSummaryCard } from '@/components/app/ProfitSummaryCard'
import { deleteParcela, getParcele, type Parcela } from '@/lib/supabase/queries/parcele'
import { AppShell } from '@/components/app/AppShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteDialog } from '@/components/app/ConfirmDeleteDialog'
import { EmptyState } from '@/components/app/EmptyState'
import { ErrorState } from '@/components/app/ErrorState'
import { Fab } from '@/components/app/Fab'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { StickyActionBar } from '@/components/app/StickyActionBar'
import { AddParcelDrawer } from '@/components/parcele/AddParcelDrawer'
import { EditParcelDialog } from '@/components/parcele/EditParcelDialog'
import { ParceleList } from '@/components/parcele/ParceleList'
import { calculateProfit } from '@/lib/calculations/profit'
import { getActivitatiAgricole } from '@/lib/supabase/queries/activitati-agricole'
import { getCheltuieli } from '@/lib/supabase/queries/cheltuieli'
import { getRecoltari } from '@/lib/supabase/queries/recoltari'
import { getVanzari } from '@/lib/supabase/queries/vanzari'
import { buildParcelaDeleteLabel } from '@/lib/ui/delete-labels'
import { computeParcelPauseStatus } from '@/lib/parcele/pauza'
import { isSuperAdmin } from '@/lib/auth/isSuperAdmin'
import { PLAN_LABELS, PLAN_LIMITS, canCreateParcel } from '@/lib/subscription/plans'
import { useMockPlan } from '@/lib/subscription/useMockPlan'
import { getSupabase } from '@/lib/supabase/client'

interface ParcelePageClientProps {
  initialParcele: Parcela[]
  initialError?: string | null
}

const SOIURI_DISPONIBILE = ['Delniwa', 'Maravilla', 'Enrosadira', 'Husaria']

export function ParcelePageClient({ initialParcele, initialError }: ParcelePageClientProps) {
  const queryClient = useQueryClient()
  const pendingDeleteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pendingDeletedItems = useRef<Record<string, Parcela>>({})

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null)
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)
  const { plan } = useMockPlan()

  const {
    data: parcele = initialParcele,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
    initialData: initialParcele,
  })

  const { data: recoltari = [] } = useQuery({
    queryKey: ['parcele', 'recoltari'],
    queryFn: getRecoltari,
  })

  const { data: vanzari = [] } = useQuery({
    queryKey: ['parcele', 'vanzari'],
    queryFn: getVanzari,
  })

  const { data: cheltuieli = [] } = useQuery({
    queryKey: ['parcele', 'cheltuieli'],
    queryFn: getCheltuieli,
  })

  const { data: activitati = [] } = useQuery({
    queryKey: ['parcele', 'activitati'],
    queryFn: getActivitatiAgricole,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteParcela,
    onSuccess: () => {
      toast.success('Parcela stearsa')
      queryClient.invalidateQueries({ queryKey: ['parcele'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
      queryClient.invalidateQueries({ queryKey: ['parcele'] })
    },
  })

  const resolvedError = initialError || (isError ? (error as Error).message : null)

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['parcele'] })
  }

  const handleOpenAddParcela = () => {
    if (isSuperAdminUser || canCreateParcel(plan, parcele.length)) {
      setAddOpen(true)
      return
    }
    setUpgradeOpen(true)
  }

  useEffect(() => {
    void (async () => {
      const supabase = getSupabase()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsSuperAdminUser(user?.id ? await isSuperAdmin(supabase, user.id) : false)
    })()

    return () => {
      Object.values(pendingDeleteTimers.current).forEach((timer) => clearTimeout(timer))
    }
  }, [])

  const scheduleDelete = (parcela: Parcela) => {
    const parcelaId = parcela.id

    pendingDeletedItems.current[parcelaId] = parcela
    queryClient.setQueryData<Parcela[]>(['parcele'], (current = []) =>
      current.filter((item) => item.id !== parcelaId)
    )

    const timer = setTimeout(() => {
      delete pendingDeleteTimers.current[parcelaId]
      delete pendingDeletedItems.current[parcelaId]
      deleteMutation.mutate(parcelaId)
    }, 5000)

    pendingDeleteTimers.current[parcelaId] = timer

    toast.warning('Parcela programata pentru stergere.', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          const pendingTimer = pendingDeleteTimers.current[parcelaId]
          if (!pendingTimer) return
          clearTimeout(pendingTimer)
          delete pendingDeleteTimers.current[parcelaId]
          delete pendingDeletedItems.current[parcelaId]
          queryClient.invalidateQueries({ queryKey: ['parcele'] })
          toast.success('Stergerea a fost anulata.')
        },
      },
    })
  }

  const parcelProfitMap = (() => {
    const parcelKg = new Map<string, number>()
    recoltari.forEach((row) => {
      if (!row.parcela_id) return
      const totalKg = Number(row.kg_cal1 || 0) + Number(row.kg_cal2 || 0)
      parcelKg.set(row.parcela_id, (parcelKg.get(row.parcela_id) ?? 0) + totalKg)
    })

    const totalKg = Array.from(parcelKg.values()).reduce((sum, value) => sum + value, 0)
    const venitTotal = vanzari.reduce((sum, row) => sum + Number(row.cantitate_kg || 0) * Number(row.pret_lei_kg || 0), 0)
    const costTotal = cheltuieli.reduce((sum, row) => sum + Number(row.suma_lei || 0), 0)

    const map: Record<string, { profit: number; margin: number }> = {}

    parcele.forEach((parcela) => {
      const kg = parcelKg.get(parcela.id) ?? 0
      if (kg <= 0 || totalKg <= 0) {
        map[parcela.id] = { profit: 0, margin: 0 }
        return
      }
      const share = kg / totalKg
      const revenue = venitTotal * share
      const cost = costTotal * share
      const metrics = calculateProfit(revenue, cost)
      map[parcela.id] = { profit: metrics.profit, margin: metrics.margin }
    })

    return map
  })()

  const totalRevenue = vanzari.reduce(
    (sum, row) => sum + Number(row.cantitate_kg || 0) * Number(row.pret_lei_kg || 0),
    0
  )
  const totalCost = cheltuieli.reduce((sum, row) => sum + Number(row.suma_lei || 0), 0)
  const parcelaPauseMap = (() => {
    const map: Record<string, { remainingDays: number; products: string[] }> = {}
    const activitiesByParcela = new Map<string, typeof activitati>()

    activitati.forEach((activitate) => {
      if (!activitate.parcela_id) return
      const list = activitiesByParcela.get(activitate.parcela_id) ?? []
      list.push(activitate)
      activitiesByParcela.set(activitate.parcela_id, list)
    })

    activitiesByParcela.forEach((activities, parcelaId) => {
      const status = computeParcelPauseStatus(activities)
      if (status.remainingDays > 0) {
        map[parcelaId] = status
      }
    })

    return map
  })()

  return (
    <AppShell
      header={
        <PageHeader
          title="Parcele"
          subtitle="Administrare terenuri cultivate"
          rightSlot={<MapIcon className="h-5 w-5" />}
        />
      }
      fab={<Fab onClick={handleOpenAddParcela} label="Adauga parcela" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Total parcele: {parcele.length}</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        <section className="agri-card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--agri-text-muted)]">Plan curent</p>
            <p className="text-base font-bold text-[var(--agri-text)]">{PLAN_LABELS[plan]}</p>
          </div>
          <div className="flex items-center gap-2">
            {PLAN_LIMITS[plan].maxParcels !== null ? (
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                Limita parcele: {PLAN_LIMITS[plan].maxParcels}
              </Badge>
            ) : null}
            <Button asChild variant="outline" className="agri-control h-9 px-3 text-xs font-semibold">
              <Link href="/planuri">Upgrade</Link>
            </Button>
          </div>
        </section>

        {resolvedError ? (
          <ErrorState title="Eroare la incarcare" message={resolvedError} onRetry={refresh} />
        ) : null}

        {isLoading ? <LoadingState label="Se incarca parcelele..." /> : null}

        {!isLoading && !resolvedError && parcele.length === 0 ? (
          <EmptyState
            title="Nu exista parcele"
            description="Incepe prin a adauga prima parcela folosind actiunea principala."
            primaryAction={{ label: 'Adauga parcela', onClick: handleOpenAddParcela }}
          />
        ) : null}

        {!isLoading && !resolvedError && parcele.length > 0 ? (
          <>
            <ProfitSummaryCard
              title="Profit per parcele"
              subtitle="Distribuire proportionala dupa kg recoltate"
              revenue={totalRevenue}
              cost={totalCost}
            />
            <ParceleList
              parcele={parcele}
              parcelProfitMap={parcelProfitMap}
              parcelPauseMap={parcelaPauseMap}
              onEdit={(parcela) => {
                setSelectedParcela(parcela)
                setEditOpen(true)
              }}
              onDelete={(parcela) => {
                setSelectedParcela(parcela)
                setDeleteOpen(true)
              }}
            />
          </>
        ) : null}
      </div>

      <AddParcelDrawer
        open={addOpen}
        onOpenChange={setAddOpen}
        soiuriDisponibile={SOIURI_DISPONIBILE}
        onCreated={refresh}
      />

      <EditParcelDialog
        open={editOpen}
        onOpenChange={(nextOpen) => {
          setEditOpen(nextOpen)
          if (!nextOpen) setSelectedParcela(null)
        }}
        parcela={selectedParcela}
        soiuriDisponibile={SOIURI_DISPONIBILE}
        onSaved={refresh}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={(nextOpen) => {
          setDeleteOpen(nextOpen)
          if (!nextOpen) setSelectedParcela(null)
        }}
        itemType="Parcela"
        itemName={buildParcelaDeleteLabel(selectedParcela)}
        description="Parcela selectata va fi stearsa definitiv."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!selectedParcela) return
          setDeleteOpen(false)
          scheduleDelete(selectedParcela)
          setSelectedParcela(null)
        }}
      />

      <AppDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        title="Limită atinsă"
        description="Planul Freemium permite o singură parcelă. Fă upgrade la Pro pentru a adăuga mai multe."
        footer={
          <>
            <Button type="button" variant="outline" className="agri-cta" onClick={() => setUpgradeOpen(false)}>
              Inchide
            </Button>
            <Button asChild className="agri-cta bg-[var(--agri-primary)] text-white hover:bg-emerald-700">
              <Link href="/planuri" onClick={() => setUpgradeOpen(false)}>
                Vezi planuri
              </Link>
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-sm text-[var(--agri-text-muted)]">
          <p>
            Planul <strong className="text-[var(--agri-text)]">{PLAN_LABELS[plan]}</strong> permite momentan{' '}
            <strong className="text-[var(--agri-text)]">{PLAN_LIMITS[plan].maxParcels}</strong> parcele.
          </p>
          <p>Upgrade la Pro pentru a adauga parcele nelimitat.</p>
        </div>
      </AppDialog>
    </AppShell>
  )
}
