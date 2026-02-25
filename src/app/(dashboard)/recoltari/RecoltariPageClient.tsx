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
import {
  deleteRecoltare,
  getRecoltari,
  type Recoltare,
} from '@/lib/supabase/queries/recoltari'

interface Parcela {
  id: string
  nume_parcela: string
}

interface RecoltariPageClientProps {
  initialRecoltari: Recoltare[]
  parcele: Parcela[]
}

export function RecoltariPageClient({ initialRecoltari, parcele }: RecoltariPageClientProps) {
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
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRecoltare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoltari'] })
      toast.success('Recoltare stearsa')
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

  const totalCantitateKg = useMemo(() => filteredRecoltari.reduce((sum, r) => sum + r.cantitate_kg, 0), [filteredRecoltari])

  return (
    <AppShell
      header={<PageHeader title="Recoltari" subtitle="Evidenta productiei recoltate" rightSlot={<Package className="h-5 w-5" />} />}
      fab={<Fab onClick={() => setAddOpen(true)} label="Adauga recoltare" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Total: {totalCantitateKg.toFixed(2)} kg</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        <Input className="agri-control h-12" placeholder="Cauta dupa parcela sau observatii..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        {isError ? <ErrorState title="Eroare" message={(error as Error).message} /> : null}
        {isLoading ? <LoadingState label="Se incarca recoltarile..." /> : null}
        {!isLoading && !isError && filteredRecoltari.length === 0 ? <EmptyState title="Nu exista recoltari" /> : null}

        {!isLoading && !isError && filteredRecoltari.length > 0 ? (
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
        itemName={deletingRecoltare?.data ? `din ${new Date(deletingRecoltare.data).toLocaleDateString('ro-RO')}` : ''}
        itemType="recoltare"
      />
    </AppShell>
  )
}
