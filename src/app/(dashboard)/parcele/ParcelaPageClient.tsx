'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Map } from 'lucide-react'
import { CompactPageHeader } from '@/components/layout/CompactPageHeader'

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
      <CompactPageHeader
        title="Parcele"
        subtitle="Administreaza terenurile cultivate."
        rightSlot={<Map className="h-5 w-5" />}
      />

      {/* List */}
      <div className="relative z-10 space-y-4 px-4 py-4">
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
