'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { toast } from 'sonner'

import { AddActivitateAgricolaDialog } from '@/components/activitati-agricole/AddActivitateAgricolaDialog'
import { EditActivitateAgricolaDialog } from '@/components/activitati-agricole/EditActivitateAgricolaDialog'
import { AppShell } from '@/components/app/AppShell'
import { ConfirmDeleteDialog } from '@/components/app/ConfirmDeleteDialog'
import { EmptyState } from '@/components/app/EmptyState'
import { ErrorState } from '@/components/app/ErrorState'
import { Fab } from '@/components/app/Fab'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { StatusChip } from '@/components/app/StatusChip'
import { StickyActionBar } from '@/components/app/StickyActionBar'
import { Button } from '@/components/ui/button'
import {
  deleteActivitateAgricola,
  getActivitatiAgricole,
  type ActivitateAgricola,
} from '@/lib/supabase/queries/activitati-agricole'

function getActivitateStatus(item: ActivitateAgricola): 'programat' | 'in_lucru' | 'finalizat' {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const aplicare = item.data_aplicare ? new Date(item.data_aplicare) : null
  if (aplicare) aplicare.setHours(0, 0, 0, 0)

  if (!aplicare || aplicare > today) return 'programat'

  const pauseDays = item.timp_pauza_zile ?? 0
  if (pauseDays > 0) {
    const recoltarePermisa = new Date(aplicare)
    recoltarePermisa.setDate(recoltarePermisa.getDate() + pauseDays)
    return today < recoltarePermisa ? 'in_lucru' : 'finalizat'
  }

  return aplicare.getTime() === today.getTime() ? 'in_lucru' : 'finalizat'
}

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
        {isError ? <ErrorState title="Eroare la incarcare" message={(error as Error).message} onRetry={refresh} /> : null}
        {isLoading ? <LoadingState label="Se incarca activitatile..." /> : null}
        {!isLoading && !isError && activitati.length === 0 ? (
          <EmptyState
            title="Nu exista activitati"
            description="Adauga prima lucrare pentru a pastra istoricul tratamentelor."
            primaryAction={{ label: 'Adauga activitate', onClick: () => setAddOpen(true) }}
          />
        ) : null}

        {activitati.map((a) => (
          <article key={a.id} className="agri-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[var(--agri-text)]">{a.tip_activitate || '-'}</h3>
                <p className="text-sm text-[var(--agri-text-muted)]">{a.produs_utilizat || '-'}</p>
                <p className="text-xs text-[var(--agri-text-muted)]">
                  {a.data_aplicare ? new Date(a.data_aplicare).toLocaleDateString() : '-'}
                </p>
                <StatusChip status={getActivitateStatus(a)} size="md" />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="agri-control h-11"
                  onClick={() => {
                    setSelected(a)
                    setEditOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button type="button" variant="outline" className="agri-control h-11 border-red-200 text-red-700" onClick={() => {
                  setToDelete(a)
                  setDeleteOpen(true)
                }}>
                  Sterge
                </Button>
              </div>
            </div>
          </article>
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
