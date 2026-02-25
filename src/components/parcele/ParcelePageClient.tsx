'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Map as MapIcon } from 'lucide-react'
import { toast } from 'sonner'

import { ProfitSummaryCard } from '@/components/app/ProfitSummaryCard'
import { deleteParcela, getParcele, type Parcela } from '@/lib/supabase/queries/parcele'
import { AppShell } from '@/components/app/AppShell'
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
import { getCheltuieli } from '@/lib/supabase/queries/cheltuieli'
import { getRecoltari } from '@/lib/supabase/queries/recoltari'
import { getVanzari } from '@/lib/supabase/queries/vanzari'

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
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null)

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

  useEffect(() => {
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
      parcelKg.set(row.parcela_id, (parcelKg.get(row.parcela_id) ?? 0) + Number(row.cantitate_kg || 0))
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

  return (
    <AppShell
      header={
        <PageHeader
          title="Parcele"
          subtitle="Administrare terenuri cultivate"
          rightSlot={<MapIcon className="h-5 w-5" />}
        />
      }
      fab={<Fab onClick={() => setAddOpen(true)} label="Adauga parcela" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Total parcele: {parcele.length}</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        {resolvedError ? (
          <ErrorState title="Eroare la incarcare" message={resolvedError} onRetry={refresh} />
        ) : null}

        {isLoading ? <LoadingState label="Se incarca parcelele..." /> : null}

        {!isLoading && !resolvedError && parcele.length === 0 ? (
          <EmptyState
            title="Nu exista parcele"
            description="Incepe prin a adauga prima parcela folosind actiunea principala."
            primaryAction={{ label: 'Adauga parcela', onClick: () => setAddOpen(true) }}
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
        itemName={selectedParcela?.nume_parcela}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!selectedParcela) return
          setDeleteOpen(false)
          scheduleDelete(selectedParcela)
          setSelectedParcela(null)
        }}
      />
    </AppShell>
  )
}
