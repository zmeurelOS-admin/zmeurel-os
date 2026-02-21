'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { createRecoltare } from '@/lib/supabase/queries/recoltari'
import { getParcele } from '@/lib/supabase/queries/parcele'
import { getCulegatori } from '@/lib/supabase/queries/culegatori'

const schema = z.object({
  data: z.string().min(1),
  parcela_id: z.string().min(1),
  culegator_id: z.string().min(1),
  nr_caserole: z.string().min(1),
  tara_per_caserola: z.string().min(1),
})

type FormData = z.infer<typeof schema>

export function AddRecoltareDialog() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: parcele = [] } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
  })

  const { data: culegatori = [] } = useQuery({
    queryKey: ['culegatori'],
    queryFn: getCulegatori,
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
    },
  })

  const nr = Number(watch('nr_caserole') || 0)
  const taraPer = Number(watch('tara_per_caserola') || 0)
  const culegatorId = watch('culegator_id')

  const culegator = culegatori.find((c: any) => c.id === culegatorId)
  const tarif = culegator?.tarif_lei_kg || 0

  const brut = nr * 0.5
  const taraTotala = nr * taraPer
  const net = brut - taraTotala
  const valoare = net * tarif

  const mutation = useMutation({
    mutationFn: createRecoltare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoltari'] })
      toast.success('Recoltare adăugată!')
      reset()
      setOpen(false)
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      data: data.data,
      parcela_id: data.parcela_id,
      culegator_id: data.culegator_id,
      nr_caserole: Number(data.nr_caserole),
      tara_kg: taraTotala,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adaugă Recoltare
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>Recoltare Nouă</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

          <Label>Culegător</Label>
          <select {...register('culegator_id')} className="w-full border p-2">
            <option value="">Selectează...</option>
            {culegatori.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.nume_prenume} ({c.tarif_lei_kg} lei/kg)
              </option>
            ))}
          </select>

          <Label>Parcelă</Label>
          <select {...register('parcela_id')} className="w-full border p-2">
            <option value="">Selectează...</option>
            {parcele.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.id_parcela} - {p.nume_parcela}
              </option>
            ))}
          </select>

          <Label>Nr. caserole</Label>
          <Input type="number" {...register('nr_caserole')} />

          <Label>Tara per caserolă (kg)</Label>
          <Input type="number" step="0.001" {...register('tara_per_caserola')} />

          <div className="bg-gray-100 p-3 rounded text-sm">
            Brut: {brut.toFixed(2)} kg<br/>
            Tara totală: {taraTotala.toFixed(2)} kg<br/>
            Net: {net.toFixed(2)} kg<br/>
            Valoare muncă: {valoare.toFixed(2)} lei
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            Salvează
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  )
}
