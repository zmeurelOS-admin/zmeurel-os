'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { AppDialog } from '@/components/app/AppDialog'
import { AppShell } from '@/components/app/AppShell'
import { EmptyState } from '@/components/app/EmptyState'
import { ErrorState } from '@/components/app/ErrorState'
import { Fab } from '@/components/app/Fab'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { StickyActionBar } from '@/components/app/StickyActionBar'
import { AddCheltuialaDialog } from '@/components/cheltuieli/AddCheltuialaDialog'
import { CheltuialaCard } from '@/components/cheltuieli/CheltuialaCard'
import { EditCheltuialaDialog } from '@/components/cheltuieli/EditCheltuialaDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createCheltuiala,
  deleteCheltuiala,
  getCheltuieli,
  updateCheltuiala,
  type Cheltuiala,
} from '@/lib/supabase/queries/cheltuieli'

interface CheltuialaFormData {
  client_sync_id?: string
  data: string
  categorie: string
  suma_lei: number | string
  furnizor?: string
  descriere?: string
}

interface CheltuialaPageClientProps {
  initialCheltuieli: Cheltuiala[]
}

export function CheltuialaPageClient({ initialCheltuieli }: CheltuialaPageClientProps) {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Cheltuiala | null>(null)
  const [deleting, setDeleting] = useState<Cheltuiala | null>(null)

  const {
    data: cheltuieli = initialCheltuieli,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['cheltuieli'],
    queryFn: getCheltuieli,
    initialData: initialCheltuieli,
  })

  const createMutation = useMutation({
    mutationFn: (data: CheltuialaFormData) =>
      createCheltuiala({
        client_sync_id: data.client_sync_id,
        data: data.data,
        categorie: data.categorie,
        suma_lei: Number(data.suma_lei),
        furnizor: data.furnizor || undefined,
        descriere: data.descriere || undefined,
        document_url: undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheltuieli'] })
      toast.success('Cheltuiala adaugata')
    },
    onError: (err: Error & { status?: number; code?: string }) => {
      const conflict = err?.status === 409 || err?.code === '23505'
      if (conflict) {
        toast.info('Inregistrarea era deja sincronizata.')
        return
      }
      toast.error(err.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CheltuialaFormData }) =>
      updateCheltuiala(id, {
        data: payload.data,
        categorie: payload.categorie,
        suma_lei: Number(payload.suma_lei),
        furnizor: payload.furnizor || undefined,
        descriere: payload.descriere || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheltuieli'] })
      toast.success('Cheltuiala actualizata')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCheltuiala,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheltuieli'] })
      toast.success('Cheltuiala stearsa')
      setDeleting(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return cheltuieli.filter((c) => (c.categorie ?? '').toLowerCase().includes(s))
  }, [cheltuieli, search])

  const total = useMemo(() => filtered.reduce((sum, c) => sum + Number(c.suma_lei || 0), 0), [filtered])

  return (
    <AppShell
      header={<PageHeader title="Cheltuieli" subtitle="Monitorizare costuri operationale" />}
      fab={<Fab onClick={() => setAddOpen(true)} label="Adauga cheltuiala" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Total: {total.toFixed(2)} lei</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        <Input className="agri-control h-12" placeholder="Cauta categorie..." value={search} onChange={(e) => setSearch(e.target.value)} />

        {isError ? <ErrorState title="Eroare" message={(error as Error).message} /> : null}
        {isLoading ? <LoadingState label="Se incarca cheltuielile..." /> : null}
        {!isLoading && !isError && filtered.length === 0 ? <EmptyState title="Nu exista cheltuieli" /> : null}

        {!isLoading && !isError && filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <CheltuialaCard
                key={c.id}
                cheltuiala={c}
                onEdit={(ch) => {
                  setEditing(ch)
                  setEditOpen(true)
                }}
                onDelete={(id) => {
                  const target = filtered.find((item) => item.id === id) ?? null
                  setDeleting(target)
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <AddCheltuialaDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={async (data) => {
          await createMutation.mutateAsync({
            client_sync_id: data.client_sync_id,
            data: data.data,
            categorie: data.categorie,
            suma_lei: data.suma_lei,
            furnizor: data.furnizor || undefined,
            descriere: data.descriere || undefined,
          })
        }}
      />

      <EditCheltuialaDialog
        cheltuiala={editing}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditing(null)
        }}
        onSubmit={async (id, data) => {
          await updateMutation.mutateAsync({
            id,
            payload: {
              data: data.data,
              categorie: data.categorie,
              suma_lei: data.suma_lei,
              furnizor: data.furnizor || undefined,
              descriere: data.descriere || undefined,
            },
          })
        }}
      />

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
          Confirmi stergerea cheltuielii <strong>{deleting?.id_cheltuiala ?? ''}</strong>?
        </p>
      </AppDialog>
    </AppShell>
  )
}
