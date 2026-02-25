'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { toast } from 'sonner'

import { AppDialog } from '@/components/app/AppDialog'
import { AppShell } from '@/components/app/AppShell'
import { EmptyState } from '@/components/app/EmptyState'
import { ErrorState } from '@/components/app/ErrorState'
import { Fab } from '@/components/app/Fab'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { StickyActionBar } from '@/components/app/StickyActionBar'
import { AddCulegatorDialog } from '@/components/culegatori/AddCulegatorDialog'
import { CulegatorCard } from '@/components/culegatori/CulegatorCard'
import { EditCulegatorDialog } from '@/components/culegatori/EditCulegatorDialog'
import { Button } from '@/components/ui/button'
import {
  createCulegator,
  deleteCulegator,
  getCulegatori,
  updateCulegator,
  type CreateCulegatorInput,
  type Culegator,
  type UpdateCulegatorInput,
} from '@/lib/supabase/queries/culegatori'

interface Props {
  initialCulegatori: Culegator[]
}

export function CulegatorPageClient({ initialCulegatori }: Props) {
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editCulegator, setEditCulegator] = useState<Culegator | null>(null)
  const [deleting, setDeleting] = useState<Culegator | null>(null)

  const {
    data: culegatori = initialCulegatori,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['culegatori'],
    queryFn: getCulegatori,
    initialData: initialCulegatori,
  })

  const createMutation = useMutation({
    mutationFn: async (formData: Record<string, unknown>) => {
      const input: CreateCulegatorInput = {
        nume_prenume: String(formData.nume_prenume ?? ''),
        telefon: formData.telefon ? String(formData.telefon) : undefined,
        tip_angajare: String(formData.tip_angajare ?? 'Sezonier'),
        tarif_lei_kg: parseFloat(String(formData.tarif_lei_kg ?? 0)),
        data_angajare: formData.data_angajare ? String(formData.data_angajare) : undefined,
        status_activ: Boolean(formData.status_activ),
      }
      return createCulegator(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['culegatori'] })
      toast.success('Culegator adaugat')
      setShowAdd(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Record<string, unknown> }) => {
      const input: UpdateCulegatorInput = {
        nume_prenume: String(formData.nume_prenume ?? ''),
        telefon: formData.telefon ? String(formData.telefon) : undefined,
        tip_angajare: String(formData.tip_angajare ?? 'Sezonier'),
        tarif_lei_kg: parseFloat(String(formData.tarif_lei_kg ?? 0)),
        data_angajare: formData.data_angajare ? String(formData.data_angajare) : undefined,
        status_activ: Boolean(formData.status_activ),
      }
      return updateCulegator(id, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['culegatori'] })
      toast.success('Culegator actualizat')
      setEditCulegator(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCulegator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['culegatori'] })
      toast.success('Culegator sters')
      setDeleting(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <AppShell
      header={<PageHeader title="Culegatori" subtitle="Evidenta echipei de lucru" rightSlot={<Users className="h-5 w-5" />} />}
      fab={<Fab onClick={() => setShowAdd(true)} label="Adauga culegator" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Total culegatori: {culegatori.length}</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        {isError ? <ErrorState title="Eroare" message={(error as Error).message} /> : null}
        {isLoading ? <LoadingState label="Se incarca culegatorii..." /> : null}
        {!isLoading && !isError && culegatori.length === 0 ? <EmptyState title="Nu exista culegatori" /> : null}

        {!isLoading && !isError && culegatori.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {culegatori.map((c) => (
              <CulegatorCard
                key={c.id}
                culegator={c}
                onEdit={setEditCulegator}
                onDelete={(id) => {
                  const target = culegatori.find((item) => item.id === id) ?? null
                  setDeleting(target)
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <AddCulegatorDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        onSubmit={async (formData) => {
          await createMutation.mutateAsync(formData as unknown as Record<string, unknown>)
        }}
      />

      {editCulegator ? (
        <EditCulegatorDialog
          open={!!editCulegator}
          onOpenChange={(open) => {
            if (!open) setEditCulegator(null)
          }}
          culegator={editCulegator}
          onSubmit={async (id, formData) => {
            await updateMutation.mutateAsync({ id, formData: formData as unknown as Record<string, unknown> })
          }}
        />
      ) : null}

      <AppDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title="Confirma stergerea"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="agri-cta" onClick={() => setDeleting(null)}>
              Anuleaza
            </Button>
            <Button
              type="button"
              className="agri-cta bg-[var(--agri-danger)] text-white"
              onClick={() => {
                if (deleting) deleteMutation.mutate(deleting.id)
              }}
              disabled={deleteMutation.isPending}
            >
              Sterge
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--agri-text-muted)]">
          Confirmi stergerea culegatorului <strong>{deleting?.nume_prenume ?? ''}</strong>?
        </p>
      </AppDialog>
    </AppShell>
  )
}
