'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { AppDialog } from '@/components/app/AppDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  kg_cal1: string
  kg_cal2: string
  observatii: string
}

function toNumber(value: string | undefined): number {
  if (!value || value.trim() === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export function EditRecoltareDialog({ recoltare, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<EditFormData>()

  useEffect(() => {
    if (recoltare && open) {
      form.reset({
        data: recoltare.data,
        parcela_id: recoltare.parcela_id ?? '',
        culegator_id: recoltare.culegator_id ?? '',
        kg_cal1: String(recoltare.kg_cal1 ?? 0),
        kg_cal2: String(recoltare.kg_cal2 ?? 0),
        observatii: recoltare.observatii ?? '',
      })
    }
  }, [recoltare, open, form])

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

  const selectedCulegatorId = form.watch('culegator_id')
  const kgCal1 = toNumber(form.watch('kg_cal1'))
  const kgCal2 = toNumber(form.watch('kg_cal2'))
  const totalKg = kgCal1 + kgCal2
  const selectedCulegator = culegatori.find((culegator) => culegator.id === selectedCulegatorId)
  const tarifLeiKg = Number(selectedCulegator?.tarif_lei_kg ?? 0)
  const hasValidTarif = Number.isFinite(tarifLeiKg) && tarifLeiKg > 0
  const valoareMunca = hasValidTarif ? totalKg * tarifLeiKg : null

  const onSubmit = (data: EditFormData) => {
    if (!recoltare || mutation.isPending) return
    if (!hasValidTarif) {
      toast.error('Culegatorul nu are tarif setat in profil')
      return
    }
    mutation.mutate({
      id: recoltare.id,
      data: {
        data: data.data,
        parcela_id: data.parcela_id || undefined,
        culegator_id: data.culegator_id || undefined,
        kg_cal1: toNumber(data.kg_cal1),
        kg_cal2: toNumber(data.kg_cal2),
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
            onClick={form.handleSubmit(onSubmit)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salveaza'}
          </Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="edit_recoltare_data">Data</Label>
          <Input id="edit_recoltare_data" type="date" className="agri-control h-12" {...form.register('data')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_recoltare_parcela">Parcela</Label>
          <Select
            value={form.watch('parcela_id') || '__none'}
            onValueChange={(value) => form.setValue('parcela_id', value === '__none' ? '' : value, { shouldDirty: true, shouldValidate: true })}
          >
            <SelectTrigger id="edit_recoltare_parcela" className="agri-control h-12">
              <SelectValue placeholder="Selecteaza parcela" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Selecteaza parcela</SelectItem>
              {parcele.map((parcela) => (
                <SelectItem key={parcela.id} value={parcela.id}>
                  {parcela.nume_parcela || 'Parcela'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_recoltare_culegator">Culegator</Label>
          <Select
            value={form.watch('culegator_id') || '__none'}
            onValueChange={(value) => form.setValue('culegator_id', value === '__none' ? '' : value, { shouldDirty: true, shouldValidate: true })}
          >
            <SelectTrigger id="edit_recoltare_culegator" className="agri-control h-12">
              <SelectValue placeholder="Selecteaza culegator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Selecteaza culegator</SelectItem>
              {culegatori.map((culegator) => (
                <SelectItem key={culegator.id} value={culegator.id}>
                  {culegator.nume_prenume || 'Culegator'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="edit_recoltare_kg_cal1">Kg Calitatea 1</Label>
            <Input
              id="edit_recoltare_kg_cal1"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="agri-control h-12"
              {...form.register('kg_cal1')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_recoltare_kg_cal2">Kg Calitatea 2</Label>
            <Input
              id="edit_recoltare_kg_cal2"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="agri-control h-12"
              {...form.register('kg_cal2')}
            />
          </div>
        </div>

        <Card className="rounded-2xl border border-emerald-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rezumat plata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Total kg: <span className="font-semibold">{totalKg.toFixed(2)} kg</span></p>
            {selectedCulegator ? (
              <>
                <p>
                  Tarif:{' '}
                  <span className="font-semibold">
                    {hasValidTarif ? `${tarifLeiKg.toFixed(2)} lei/kg` : '--'}
                  </span>{' '}
                  <span className="text-xs text-[var(--agri-text-muted)]">(din profil culegator)</span>
                </p>
                <p>
                  De plata:{' '}
                  <span className="font-semibold">
                    {valoareMunca !== null ? `${valoareMunca.toFixed(2)} lei` : '--'}
                  </span>
                </p>
              </>
            ) : (
              <>
                <p className="text-[var(--agri-text-muted)]">Selecteaza culegatorul ca sa calculez plata</p>
                <p>De plata: <span className="font-semibold">--</span></p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="edit_recoltare_observatii">Observatii</Label>
          <Textarea
            id="edit_recoltare_observatii"
            rows={4}
            className="agri-control w-full px-3 py-2 text-base"
            {...form.register('observatii')}
          />
        </div>
      </form>
    </AppDialog>
  )
}
