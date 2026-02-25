'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Search } from 'lucide-react'
import { toast } from 'sonner'

import { AddActivitateAgricolaDialog } from '@/components/activitati-agricole/AddActivitateAgricolaDialog'
import { EditActivitateAgricolaDialog } from '@/components/activitati-agricole/EditActivitateAgricolaDialog'
import { AppShell } from '@/components/app/AppShell'
import { CompactListCard } from '@/components/app/CompactListCard'
import { ConfirmDeleteDialog } from '@/components/app/ConfirmDeleteDialog'
import { EmptyState } from '@/components/app/EmptyState'
import { ErrorState } from '@/components/app/ErrorState'
import { Fab } from '@/components/app/Fab'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { StickyActionBar } from '@/components/app/StickyActionBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  deleteActivitateAgricola,
  getActivitatiAgricole,
  type ActivitateAgricola,
} from '@/lib/supabase/queries/activitati-agricole'

export default function ActivitatiPage() {
  const queryClient = useQueryClient()
  const pendingDeleteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pendingDeletedItems = useRef<Record<string, ActivitateAgricola>>({})

  const {
    data: activitati = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['activitati'],
    queryFn: getActivitatiAgricole,
  })

  const [addOpen, setAddOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<ActivitateAgricola | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toDelete, setToDelete] = useState<ActivitateAgricola | null>(null)

  const deleteMutation = useMutation({
    mutationFn: deleteActivitateAgricola,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activitati'] })
      toast.success('Activitate stearsa')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      queryClient.invalidateQueries({ queryKey: ['activitati'] })
    },
  })

  useEffect(() => {
    return () => {
      Object.values(pendingDeleteTimers.current).forEach((timer) => clearTimeout(timer))
    }
  }, [])

  const scheduleDelete = (activitate: ActivitateAgricola) => {
    const activitateId = activitate.id

    pendingDeletedItems.current[activitateId] = activitate
    queryClient.setQueryData<ActivitateAgricola[]>(['activitati'], (current = []) =>
      current.filter((item) => item.id !== activitateId)
    )

    const timer = setTimeout(() => {
      delete pendingDeleteTimers.current[activitateId]
      delete pendingDeletedItems.current[activitateId]
      deleteMutation.mutate(activitateId)
    }, 5000)

    pendingDeleteTimers.current[activitateId] = timer

    toast.warning('Activitatea a fost programata pentru stergere.', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          const pendingTimer = pendingDeleteTimers.current[activitateId]
          if (!pendingTimer) return
          clearTimeout(pendingTimer)
          delete pendingDeleteTimers.current[activitateId]
          delete pendingDeletedItems.current[activitateId]
          queryClient.invalidateQueries({ queryKey: ['activitati'] })
          toast.success('Stergerea a fost anulata.')
        },
      },
    })
  }

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['activitati'] })
  }

  const filteredActivitati = useMemo(() => {
    if (!searchQuery.trim()) return activitati

    const term = searchQuery.toLowerCase().trim()
    return activitati.filter((item) =>
      [
        item.tip_activitate,
        item.produs_utilizat,
        item.doza,
        item.observatii,
        item.operator,
        item.id_activitate,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term))
    )
  }, [activitati, searchQuery])

  return (
    <AppShell
      header={<PageHeader title="Activitati Agricole" subtitle="Istoric lucrari si tratamente" rightSlot={<ClipboardList className="h-5 w-5" />} />}
      fab={<Fab onClick={() => setAddOpen(true)} label="Adauga activitate" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Total activitati: {activitati.length}</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        <div className="flex items-center gap-2">
          <Input
            className="agri-control h-12"
            placeholder="Cauta activitate, produs, doza..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="button" variant="outline" className="h-12 w-12 shrink-0 p-0" aria-label="Cauta activitati">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {isError ? <ErrorState title="Eroare la incarcare" message={(error as Error).message} onRetry={refresh} /> : null}
        {isLoading ? <LoadingState label="Se incarca activitatile..." /> : null}
        {!isLoading && !isError && filteredActivitati.length === 0 ? (
          <EmptyState
            title="Nu exista activitati"
            description="Adauga prima lucrare pentru a pastra istoricul tratamentelor."
            primaryAction={{ label: 'Adauga activitate', onClick: () => setAddOpen(true) }}
          />
        ) : null}

        {filteredActivitati.map((a) => (
          <CompactListCard
            key={a.id}
            title={a.tip_activitate || '-'}
            subtitle={`${a.data_aplicare ? new Date(a.data_aplicare).toLocaleDateString('ro-RO') : '-'}`}
            metadata={a.produs_utilizat || undefined}
            trailingMeta={a.timp_pauza_zile ? `Pauza: ${a.timp_pauza_zile} zile` : undefined}
            onEdit={() => {
              setSelected(a)
              setEditOpen(true)
            }}
            onDelete={() => {
              setToDelete(a)
              setDeleteOpen(true)
            }}
          />
        ))}
      </div>

      <AddActivitateAgricolaDialog open={addOpen} onOpenChange={setAddOpen} hideTrigger />

      <EditActivitateAgricolaDialog
        activitate={selected}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setSelected(null)
        }}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setToDelete(null)
        }}
        itemType="Activitate"
        itemName={toDelete?.tip_activitate || 'activitatea selectata'}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!toDelete) return
          setDeleteOpen(false)
          scheduleDelete(toDelete)
          setToDelete(null)
        }}
      />
    </AppShell>
  )
}
