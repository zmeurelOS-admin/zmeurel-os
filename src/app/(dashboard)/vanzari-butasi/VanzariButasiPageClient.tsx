'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { AppShell } from '@/components/app/AppShell'
import { EmptyState } from '@/components/app/EmptyState'
import { ErrorState } from '@/components/app/ErrorState'
import { Fab } from '@/components/app/Fab'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { StickyActionBar } from '@/components/app/StickyActionBar'
import { DeleteConfirmDialog } from '@/components/parcele/DeleteConfirmDialog'
import { AddVanzareButasiDialog } from '@/components/vanzari-butasi/AddVanzareButasiDialog'
import { EditVanzareButasiDialog } from '@/components/vanzari-butasi/EditVanzareButasiDialog'
import { VanzareButasiCard } from '@/components/vanzari-butasi/VanzareButasiCard'
import { Input } from '@/components/ui/input'
import {
  deleteVanzareButasi,
  getVanzariButasi,
  type VanzareButasi,
} from '@/lib/supabase/queries/vanzari-butasi'

interface Client {
  id: string
  nume_client: string
}

interface Parcela {
  id: string
  nume_parcela: string
}

interface VanzariButasiPageClientProps {
  initialVanzari: VanzareButasi[]
  clienti: Client[]
  parcele: Parcela[]
}

export function VanzariButasiPageClient({ initialVanzari, clienti, parcele }: VanzariButasiPageClientProps) {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editingVanzare, setEditingVanzare] = useState<VanzareButasi | null>(null)
  const [deletingVanzare, setDeletingVanzare] = useState<VanzareButasi | null>(null)

  const {
    data: vanzari = initialVanzari,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['vanzari-butasi'],
    queryFn: getVanzariButasi,
    initialData: initialVanzari,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteVanzareButasi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vanzari-butasi'] })
      toast.success('Vanzare stearsa')
      setDeletingVanzare(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const clientMap = useMemo(() => {
    const map: Record<string, string> = {}
    clienti.forEach((c) => {
      map[c.id] = c.nume_client || 'Client'
    })
    return map
  }, [clienti])

  const parcelaMap = useMemo(() => {
    const map: Record<string, string> = {}
    parcele.forEach((p) => {
      map[p.id] = p.nume_parcela || 'Parcela'
    })
    return map
  }, [parcele])

  const filteredVanzari = useMemo(() => {
    if (!searchTerm) return vanzari
    const term = searchTerm.toLowerCase()

    return vanzari.filter(
      (vb) =>
        vb.soi_butasi?.toLowerCase().includes(term) ||
        (vb.client_id && clientMap[vb.client_id]?.toLowerCase().includes(term)) ||
        vb.observatii?.toLowerCase().includes(term)
    )
  }, [vanzari, searchTerm, clientMap])

  const totalVenit = useMemo(
    () => filteredVanzari.reduce((sum, vb) => sum + vb.cantitate_butasi * vb.pret_unitar_lei, 0),
    [filteredVanzari]
  )

  return (
    <AppShell
      header={<PageHeader title="Vanzari Butasi" subtitle="Gestionare vanzari material saditor" />}
      fab={<Fab onClick={() => setAddOpen(true)} label="Adauga vanzare butasi" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Venit total: {totalVenit.toFixed(2)} lei</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        <Input className="agri-control h-12" placeholder="Cauta dupa soi, client sau observatii..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        {isError ? <ErrorState title="Eroare" message={(error as Error).message} /> : null}
        {isLoading ? <LoadingState label="Se incarca vanzarile..." /> : null}
        {!isLoading && !isError && filteredVanzari.length === 0 ? <EmptyState title="Nu exista vanzari" /> : null}

        {!isLoading && !isError && filteredVanzari.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredVanzari.map((vanzare) => (
              <VanzareButasiCard
                key={vanzare.id}
                vanzare={vanzare}
                clientNume={vanzare.client_id ? clientMap[vanzare.client_id] : undefined}
                parcelaNume={vanzare.parcela_sursa_id ? parcelaMap[vanzare.parcela_sursa_id] : undefined}
                onEdit={setEditingVanzare}
                onDelete={setDeletingVanzare}
              />
            ))}
          </div>
        ) : null}
      </div>

      <AddVanzareButasiDialog open={addOpen} onOpenChange={setAddOpen} hideTrigger />

      <EditVanzareButasiDialog
        vanzare={editingVanzare}
        open={!!editingVanzare}
        onOpenChange={(open) => {
          if (!open) setEditingVanzare(null)
        }}
      />

      <DeleteConfirmDialog
        open={!!deletingVanzare}
        onOpenChange={(open) => {
          if (!open) setDeletingVanzare(null)
        }}
        onConfirm={() => {
          if (deletingVanzare) deleteMutation.mutate(deletingVanzare.id)
        }}
        itemName={deletingVanzare?.data ? `din ${new Date(deletingVanzare.data).toLocaleDateString('ro-RO')}` : ''}
        itemType="vanzare"
      />
    </AppShell>
  )
}
