'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { AppShell } from '@/components/app/AppShell'
import { ConfirmDeleteDialog } from '@/components/app/ConfirmDeleteDialog'
import { EmptyState } from '@/components/app/EmptyState'
import { ErrorState } from '@/components/app/ErrorState'
import { Fab } from '@/components/app/Fab'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { StickyActionBar } from '@/components/app/StickyActionBar'
import { AddVanzareDialog } from '@/components/vanzari/AddVanzareDialog'
import { EditVanzareDialog } from '@/components/vanzari/EditVanzareDialog'
import { VanzareCard } from '@/components/vanzari/VanzareCard'
import { Input } from '@/components/ui/input'
import { trackEvent } from '@/lib/analytics/trackEvent'
import {
  deleteVanzare,
  getVanzari,
  type Vanzare,
} from '@/lib/supabase/queries/vanzari'
import { buildVanzareDeleteLabel } from '@/lib/ui/delete-labels'

interface Client {
  id: string
  nume: string
}

interface VanzariPageClientProps {
  initialVanzari: Vanzare[]
  clienti: Client[]
}

export function VanzariPageClient({ initialVanzari, clienti }: VanzariPageClientProps) {
  const queryClient = useQueryClient()
  const pendingDeleteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pendingDeletedItems = useRef<Record<string, Vanzare>>({})

  const [searchTerm, setSearchTerm] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editingVanzare, setEditingVanzare] = useState<Vanzare | null>(null)
  const [deletingVanzare, setDeletingVanzare] = useState<Vanzare | null>(null)

  const {
    data: vanzari = initialVanzari,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['vanzari'],
    queryFn: getVanzari,
    initialData: initialVanzari,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteVanzare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vanzari'] })
      trackEvent('delete_item', 'vanzari')
      toast.success('Vânzare ștearsă')
      setDeletingVanzare(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
      queryClient.invalidateQueries({ queryKey: ['vanzari'] })
    },
  })

  useEffect(() => {
    return () => {
      Object.values(pendingDeleteTimers.current).forEach((timer) => clearTimeout(timer))
    }
  }, [])

  const scheduleDelete = (vanzare: Vanzare) => {
    const vanzareId = vanzare.id

    pendingDeletedItems.current[vanzareId] = vanzare
    queryClient.setQueryData<Vanzare[]>(['vanzari'], (current = []) =>
      current.filter((item) => item.id !== vanzareId)
    )

    const timer = setTimeout(() => {
      delete pendingDeleteTimers.current[vanzareId]
      delete pendingDeletedItems.current[vanzareId]
      deleteMutation.mutate(vanzareId)
    }, 5000)

    pendingDeleteTimers.current[vanzareId] = timer

    toast.warning('Vânzarea a fost programată pentru ștergere.', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          const pendingTimer = pendingDeleteTimers.current[vanzareId]
          if (!pendingTimer) return
          clearTimeout(pendingTimer)
          delete pendingDeleteTimers.current[vanzareId]
          delete pendingDeletedItems.current[vanzareId]
          queryClient.invalidateQueries({ queryKey: ['vanzari'] })
          toast.success('Ștergerea a fost anulată.')
        },
      },
    })
  }

  const clientMap = useMemo(() => {
    const map: Record<string, string> = {}
    clienti.forEach((c) => {
      map[c.id] = c.nume
    })
    return map
  }, [clienti])

  const filteredVanzari = useMemo(() => {
    if (!searchTerm) return vanzari
    const term = searchTerm.toLowerCase()

    return vanzari.filter(
      (v) =>
        (v.client_id && clientMap[v.client_id]?.toLowerCase().includes(term)) ||
        v.status_plata.toLowerCase().includes(term) ||
        v.observatii_ladite?.toLowerCase().includes(term)
    )
  }, [vanzari, searchTerm, clientMap])

  const total = useMemo(
    () => filteredVanzari.reduce((sum, v) => sum + v.cantitate_kg * v.pret_lei_kg, 0),
    [filteredVanzari]
  )

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['vanzari'] })
  }

  return (
    <AppShell
      header={<PageHeader title="Vânzări Fructe" subtitle="Gestionare venituri din producție" />}
      fab={<Fab onClick={() => setAddOpen(true)} label="Adaugă vânzare" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Venit total: {total.toFixed(2)} lei</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        <Input className="agri-control h-12" placeholder="Caută după client sau status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        {isError ? <ErrorState title="Eroare la încărcare" message={(error as Error).message} onRetry={refresh} /> : null}
        {isLoading ? <LoadingState label="Se încarcă vânzările..." /> : null}
        {!isLoading && !isError && filteredVanzari.length === 0 ? (
          <EmptyState
            title="Nu există vânzări"
            description="Înregistrează prima vânzare pentru a urmări veniturile."
            primaryAction={{ label: 'Adaugă vânzare', onClick: () => setAddOpen(true) }}
          />
        ) : null}

        {!isLoading && !isError && filteredVanzari.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredVanzari.map((vanzare) => (
              <VanzareCard
                key={vanzare.id}
                vanzare={vanzare}
                clientNume={vanzare.client_id ? clientMap[vanzare.client_id] : undefined}
                onEdit={setEditingVanzare}
                onDelete={setDeletingVanzare}
              />
            ))}
          </div>
        ) : null}
      </div>

      <AddVanzareDialog open={addOpen} onOpenChange={setAddOpen} hideTrigger />

      <EditVanzareDialog
        vanzare={editingVanzare}
        open={!!editingVanzare}
        onOpenChange={(open) => {
          if (!open) setEditingVanzare(null)
        }}
      />

      <ConfirmDeleteDialog
        open={!!deletingVanzare}
        onOpenChange={(open) => {
          if (!open) setDeletingVanzare(null)
        }}
        onConfirm={() => {
          if (!deletingVanzare) return
          scheduleDelete(deletingVanzare)
          setDeletingVanzare(null)
        }}
        itemName={buildVanzareDeleteLabel(
          deletingVanzare,
          deletingVanzare?.client_id ? clientMap[deletingVanzare.client_id] : ''
        )}
        itemType="Vânzare"
        description="Vânzarea selectată va fi ștearsă definitiv."
        loading={deleteMutation.isPending}
      />
    </AppShell>
  )
}
