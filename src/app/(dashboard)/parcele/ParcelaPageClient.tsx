'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Map } from 'lucide-react'

import {
  getParcele,
  deleteParcela,
  type Parcela,
} from '@/lib/supabase/queries/parcele'

import { AddParcelaDialog } from '@/components/parcele/AddParcelaDialog'
import { EditParcelaDialog } from '@/components/parcele/EditParcelaDialog'
import { DeleteConfirmDialog } from '@/components/parcele/DeleteConfirmDialog'
import { ParcelaCard } from '@/components/parcele/ParcelaCard'

interface ParcelaPageClientProps {
  initialParcele: Parcela[]
}

export function ParcelaPageClient({
  initialParcele,
}: ParcelaPageClientProps) {
  const queryClient = useQueryClient()
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: parcele = initialParcele, isLoading } = useQuery({
    queryKey: ['parcele'],
    queryFn: () => getParcele(),
    initialData: initialParcele,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteParcela(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcele'] })
      toast.success('Parcela stearsa')
      setDeleteOpen(false)
      setSelectedParcela(null)
    },
  })

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gray-50">
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-emerald-700 to-emerald-600" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Parcele
            </h1>
            <p className="mt-1 text-sm text-emerald-100">
              Administreaza terenurile cultivate.
            </p>
          </div>
          <div className="rounded-xl bg-white/20 p-3 shadow-sm">
            <Map className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="relative z-10 space-y-4 px-5 py-4">
        {isLoading && (
          <p className="text-center text-sm text-gray-600">
            Se incarca...
          </p>
        )}

        {!isLoading && parcele.length === 0 && (
          <p className="text-center text-sm text-gray-600">
            Nu exista parcele.
          </p>
        )}

        {!isLoading &&
          parcele.map((p) => (
            <ParcelaCard
              key={p.id}
              parcela={p}
              onEdit={() => {
                setSelectedParcela(p)
                setEditOpen(true)
              }}
              onDelete={() => {
                setSelectedParcela(p)
                setDeleteOpen(true)
              }}
            />
          ))}
      </div>

      {/* Floating Action Button */}
      <AddParcelaDialog
        soiuriDisponibile={[
          'Delniwa',
          'Maravilla',
          'Enrosadira',
          'Husaria',
        ]}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ['parcele'] })
        }
      />

      <EditParcelaDialog
        parcela={selectedParcela}
        open={editOpen}
        onOpenChange={setEditOpen}
        soiuriDisponibile={[
          'Delniwa',
          'Maravilla',
          'Enrosadira',
          'Husaria',
        ]}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ['parcele'] })
        }
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        parcelaNume={selectedParcela?.nume_parcela || ''}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (selectedParcela) {
            deleteMutation.mutate(selectedParcela.id)
          }
        }}
      />
    </div>
  )
}
