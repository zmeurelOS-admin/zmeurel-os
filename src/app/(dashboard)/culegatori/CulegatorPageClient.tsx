'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
  Culegator,
  getCulegatori,
  createCulegator,
  updateCulegator,
  deleteCulegator,
  CreateCulegatorInput,
  UpdateCulegatorInput,
} from '@/lib/supabase/queries/culegatori'
import { CulegatorCard } from '@/components/culegatori/CulegatorCard'
import { AddCulegatorDialog } from '@/components/culegatori/AddCulegatorDialog'
import { EditCulegatorDialog } from '@/components/culegatori/EditCulegatorDialog'

interface Props {
  initialCulegatori: Culegator[]
}

export function CulegatorPageClient({ initialCulegatori }: Props) {
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editCulegator, setEditCulegator] = useState<Culegator | null>(null)

  const { data: culegatori = initialCulegatori } = useQuery({
    queryKey: ['culegatori'],
    queryFn: getCulegatori,
    initialData: initialCulegatori,
  })

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const input: CreateCulegatorInput = {
        ...formData,
        tarif_lei_kg: parseFloat(formData.tarif_lei_kg),
      }
      return createCulegator(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['culegatori'] })
      toast.success('Culegător adăugat!')
      setShowAdd(false)
    },
    onError: (error) => {
      console.error('Error:', JSON.stringify(error))
      toast.error('Eroare la adăugare')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: any }) => {
      const input: UpdateCulegatorInput = {
        ...formData,
        tarif_lei_kg: parseFloat(formData.tarif_lei_kg),
      }
      return updateCulegator(id, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['culegatori'] })
      toast.success('Culegător actualizat!')
      setEditCulegator(null)
    },
    onError: (error) => {
      console.error('Error:', JSON.stringify(error))
      toast.error('Eroare la actualizare')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCulegator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['culegatori'] })
      toast.success('Culegător șters!')
    },
    onError: (error) => {
      console.error('Error:', JSON.stringify(error))
      toast.error('Eroare la ștergere')
    },
  })

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Ștergi culegătorul "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Culegători</h1>
        <Button
          onClick={() => setShowAdd(true)}
          style={{ backgroundColor: '#F16B6B', color: 'white' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Culegător
        </Button>
      </div>

      {culegatori.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nu există culegători înregistrați.</p>
          <p className="text-sm mt-1">Apasă "Adaugă Culegător" pentru a începe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {culegatori.map((c) => (
            <CulegatorCard
              key={c.id}
              culegator={c}
              onEdit={setEditCulegator}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddCulegatorDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        onSubmit={async (formData) => {
          await createMutation.mutateAsync(formData)
        }}
      />

      {editCulegator && (
        <EditCulegatorDialog
          open={!!editCulegator}
          onOpenChange={(open) => !open && setEditCulegator(null)}
          culegator={editCulegator}
          onSubmit={async (id, formData) => {
            await updateMutation.mutateAsync({ id, formData })
          }}
        />
      )}
    </div>
  )
}