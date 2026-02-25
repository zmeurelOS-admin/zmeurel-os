'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { AppDialog } from '@/components/app/AppDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getCulegatori } from '@/lib/supabase/queries/culegatori'
import { getParcele } from '@/lib/supabase/queries/parcele'
import { Recoltare, updateRecoltare, type UpdateRecoltareInput } from '@/lib/supabase/queries/recoltari'

interface Props {
  recoltare: Recoltare | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface EditFormData {
  data: string
  parcela_id: string
  culegator_id: string
  cantitate_kg: number
  observatii: string
}

export function EditRecoltareDialog({ recoltare, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset } = useForm<EditFormData>()

  useEffect(() => {
    if (recoltare && open) {
      reset({
        data: recoltare.data,
        parcela_id: recoltare.parcela_id ?? '',
        culegator_id: recoltare.culegator_id ?? '',
        cantitate_kg: recoltare.cantitate_kg,
        observatii: recoltare.observatii ?? '',
      })
    }
  }, [recoltare, open, reset])

  const { data: parcele = [] } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
  })

  const { data: culegatori = [] } = useQuery({
    queryKey: ['culegatori'],
    queryFn: getCulegatori,
  })

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecoltareInput }) =>
      updateRecoltare(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoltari'] })
      toast.success('Recoltare actualizata')
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Eroare la actualizare')
    },
  })

  const onSubmit = (data: EditFormData) => {
    if (!recoltare || mutation.isPending) return
    mutation.mutate({
      id: recoltare.id,
      data: {
        data: data.data,
        parcela_id: data.parcela_id || undefined,
        culegator_id: data.culegator_id || undefined,
        cantitate_kg: Number(data.cantitate_kg),
        observatii: data.observatii?.trim() || undefined,
      },
    })
  }

  if (!recoltare) return null

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editeaza recoltare"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="agri-cta" onClick={() => onOpenChange(false)}>
            Anuleaza
          </Button>
          <Button
            type="button"
            className="agri-cta bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
            onClick={handleSubmit(onSubmit)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salveaza'}
          </Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="edit_recoltare_data">Data</Label>
          <Input id="edit_recoltare_data" type="date" className="agri-control h-12" {...register('data')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_recoltare_parcela">Parcela</Label>
          <select
            id="edit_recoltare_parcela"
            className="agri-control h-12 w-full px-3 text-base"
            {...register('parcela_id')}
          >
            <option value="">Selecteaza parcela</option>
            {parcele.map((parcela) => (
              <option key={parcela.id} value={parcela.id}>
                {parcela.nume_parcela || 'Parcela'}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_recoltare_culegator">Culegator</Label>
          <select
            id="edit_recoltare_culegator"
            className="agri-control h-12 w-full px-3 text-base"
            {...register('culegator_id')}
          >
            <option value="">Selecteaza culegator</option>
            {culegatori.map((culegator) => (
              <option key={culegator.id} value={culegator.id}>
                {culegator.nume_prenume || 'Culegator'}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_recoltare_cantitate">Cantitate (kg)</Label>
          <Input
            id="edit_recoltare_cantitate"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="agri-control h-12"
            {...register('cantitate_kg', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_recoltare_observatii">Observatii</Label>
          <Textarea
            id="edit_recoltare_observatii"
            rows={4}
            className="agri-control w-full px-3 py-2 text-base"
            {...register('observatii')}
          />
        </div>
      </form>
    </AppDialog>
  )
}
