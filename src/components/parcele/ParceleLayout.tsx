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
import { CompactPageHeader } from '@/components/layout/CompactPageHeader'

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
      <CompactPageHeader
        title="Parcele"
        subtitle="Administrare terenuri cultivate"
        rightSlot={<Map className="h-5 w-5" />}
      />

      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(var(--safe-b)+24px)]">
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
