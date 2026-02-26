'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import { toast } from 'sonner'

import { AppShell } from '@/components/app/AppShell'
import { EmptyState } from '@/components/app/EmptyState'
import { ErrorState } from '@/components/app/ErrorState'
import { Fab } from '@/components/app/Fab'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { StickyActionBar } from '@/components/app/StickyActionBar'
import { AddRecoltareDialog } from '@/components/recoltari/AddRecoltareDialog'
import { EditRecoltareDialog } from '@/components/recoltari/EditRecoltareDialog'
import { RecoltareCard } from '@/components/recoltari/RecoltareCard'
import { DeleteConfirmDialog } from '@/components/parcele/DeleteConfirmDialog'
import { Input } from '@/components/ui/input'
import { trackEvent } from '@/lib/analytics/trackEvent'
import {
  deleteRecoltare,
  getRecoltari,
  type Recoltare,
} from '@/lib/supabase/queries/recoltari'
import { buildRecoltareDeleteLabel } from '@/lib/ui/delete-labels'

interface Parcela {
  id: string
  nume_parcela: string
}

interface RecoltariPageClientProps {
  initialRecoltari: Recoltare[]
  parcele: Parcela[]
  initialError?: string | null
}

export function RecoltariPageClient({ initialRecoltari, parcele, initialError = null }: RecoltariPageClientProps) {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editingRecoltare, setEditingRecoltare] = useState<Recoltare | null>(null)
  const [deletingRecoltare, setDeletingRecoltare] = useState<Recoltare | null>(null)

  const {
    data: recoltari = initialRecoltari,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['recoltari'],
    queryFn: getRecoltari,
    initialData: initialRecoltari,
    enabled: !initialError,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRecoltare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoltari'] })
      trackEvent('delete_item', 'recoltari')
      toast.success('Recoltare ștearsă')
      setDeletingRecoltare(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const parcelaMap = useMemo(() => {
    const map: Record<string, string> = {}
    parcele.forEach((p) => {
      map[p.id] = p.nume_parcela || 'Parcela'
    })
    return map
  }, [parcele])

  const filteredRecoltari = useMemo(() => {
    if (!searchTerm) return recoltari
    const term = searchTerm.toLowerCase()
    return recoltari.filter(
      (r) =>
        (r.parcela_id && parcelaMap[r.parcela_id]?.toLowerCase().includes(term)) ||
        (r.observatii?.toLowerCase().includes(term) ?? false)
    )
  }, [recoltari, searchTerm, parcelaMap])

  const getRecoltareKg = (recoltare: Recoltare) => {
    const kgCal1 = Number(recoltare.kg_cal1 ?? 0)
    const kgCal2 = Number(recoltare.kg_cal2 ?? 0)
    return kgCal1 + kgCal2
  }

  const totalCantitateKg = useMemo(
    () => filteredRecoltari.reduce((sum, r) => sum + getRecoltareKg(r), 0),
    [filteredRecoltari]
  )

  return (
    <AppShell
      header={<PageHeader title="Recoltări" subtitle="Evidența producției recoltate" rightSlot={<Package className="h-5 w-5" />} />}
      fab={initialError ? undefined : <Fab onClick={() => setAddOpen(true)} label="Adaugă recoltare" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Total: {totalCantitateKg.toFixed(2)} kg</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        <Input className="agri-control h-12" placeholder="Caută după parcelă sau observații..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        {initialError ? <ErrorState title="Eroare" message={initialError} /> : null}
        {isError && !initialError ? <ErrorState title="Eroare" message={(error as Error).message} /> : null}
        {isLoading ? <LoadingState label="Se încarcă recoltările..." /> : null}
        {!isLoading && !isError && !initialError && filteredRecoltari.length === 0 ? <EmptyState title="Nu există recoltări" /> : null}

        {!isLoading && !isError && !initialError && filteredRecoltari.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecoltari.map((recoltare) => (
              <RecoltareCard
                key={recoltare.id}
                recoltare={recoltare}
                parcelaNume={recoltare.parcela_id ? parcelaMap[recoltare.parcela_id] : undefined}
                onDelete={setDeletingRecoltare}
                onEdit={setEditingRecoltare}
              />
            ))}
          </div>
        ) : null}
      </div>

      <AddRecoltareDialog open={addOpen} onOpenChange={setAddOpen} hideTrigger />

      <EditRecoltareDialog
        recoltare={editingRecoltare}
        open={!!editingRecoltare}
        onOpenChange={(open) => {
          if (!open) setEditingRecoltare(null)
        }}
      />

      <DeleteConfirmDialog
        open={!!deletingRecoltare}
        onOpenChange={(open) => {
          if (!open) setDeletingRecoltare(null)
        }}
        onConfirm={() => {
          if (deletingRecoltare) deleteMutation.mutate(deletingRecoltare.id)
        }}
        itemName={buildRecoltareDeleteLabel(
          deletingRecoltare,
          deletingRecoltare?.parcela_id ? parcelaMap[deletingRecoltare.parcela_id] : ''
        )}
        itemType="recoltare"
        description="Recoltarea selectată va fi ștearsă definitiv."
      />
    </AppShell>
  )
}
