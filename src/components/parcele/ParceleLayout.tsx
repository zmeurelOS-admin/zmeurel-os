'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Map } from 'lucide-react'
import { toast } from 'sonner'

import { deleteParcela, getParcele, type Parcela } from '@/lib/supabase/queries/parcele'
import { AddParcelDrawer } from '@/components/parcele/AddParcelDrawer'
import { EditParcelDialog } from '@/components/parcele/EditParcelDialog'
import { Fab } from '@/components/parcele/Fab'
import { ParcelaCard } from '@/components/parcele/ParcelaCard'
import { DeleteConfirmDialog } from '@/components/parcele/DeleteConfirmDialog'

interface ParceleLayoutProps {
  initialParcele: Parcela[]
}

const SOIURI_DISPONIBILE = ['Delniwa', 'Maravilla', 'Enrosadira', 'Husaria']

export function ParceleLayout({ initialParcele }: ParceleLayoutProps) {
  const queryClient = useQueryClient()

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null)

  const { data: parcele = initialParcele, isLoading } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
    initialData: initialParcele,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteParcela,
    onSuccess: () => {
      toast.success('Parcela a fost stearsa')
      queryClient.invalidateQueries({ queryKey: ['parcele'] })
      setDeleteOpen(false)
      setSelectedParcela(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const refreshParcele = () => {
    queryClient.invalidateQueries({ queryKey: ['parcele'] })
  }

  const handleDelete = (parcela: Parcela) => {
    setSelectedParcela(parcela)
    setDeleteOpen(true)
  }

  return (
    <div className="fixed inset-0 flex h-[100dvh] min-h-[100svh] flex-col overflow-hidden bg-slate-50 lg:static lg:h-full lg:min-h-full">
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-emerald-700 to-emerald-600" />

      <header className="relative z-20 shrink-0 px-5 pt-[calc(var(--safe-t)+12px)] pb-4">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Parcele</h1>
            <p className="mt-1 text-sm text-emerald-100">Administrare terenuri cultivate</p>
          </div>
          <div className="rounded-xl bg-white/20 p-3 text-white shadow-sm">
            <Map className="h-5 w-5" />
          </div>
        </div>
      </header>

      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(var(--safe-b)+24px)]">
        <div className="mx-auto w-full max-w-3xl space-y-4 py-4">
          {isLoading && <p className="text-center text-sm text-slate-600">Se incarca...</p>}

          {!isLoading && parcele.length === 0 && (
            <p className="rounded-2xl bg-white p-5 text-center text-sm text-slate-600 shadow-sm">
              Nu exista parcele.
            </p>
          )}

          {!isLoading &&
            parcele.map((parcela) => (
              <ParcelaCard
                key={parcela.id}
                parcela={parcela}
                onEdit={() => {
                  setSelectedParcela(parcela)
                  setEditOpen(true)
                }}
                onDelete={() => handleDelete(parcela)}
              />
            ))}
        </div>
      </main>

      <Fab onClick={() => setAddOpen(true)} />

      <AddParcelDrawer
        open={addOpen}
        onOpenChange={setAddOpen}
        soiuriDisponibile={SOIURI_DISPONIBILE}
        onCreated={refreshParcele}
      />

      <EditParcelDialog
        open={editOpen}
        onOpenChange={(nextOpen) => {
          setEditOpen(nextOpen)
          if (!nextOpen) setSelectedParcela(null)
        }}
        parcela={selectedParcela}
        soiuriDisponibile={SOIURI_DISPONIBILE}
        onSaved={refreshParcele}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        parcelaNume={selectedParcela?.nume_parcela || ''}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!selectedParcela) return
          deleteMutation.mutate(selectedParcela.id)
        }}
      />
    </div>
  )
}
