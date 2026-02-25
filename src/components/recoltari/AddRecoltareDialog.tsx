'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { AppDrawer } from '@/components/app/AppDrawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { trackEvent } from '@/lib/analytics/trackEvent'
import { getCulegatori } from '@/lib/supabase/queries/culegatori'
import { getParcele } from '@/lib/supabase/queries/parcele'
import { createRecoltare } from '@/lib/supabase/queries/recoltari'

const schema = z.object({
  data: z.string().min(1, 'Data este obligatorie'),
  parcela_id: z.string().min(1, 'Parcela este obligatorie'),
  culegator_id: z.string().min(1, 'Culegatorul este obligatoriu'),
  cantitate_kg: z
    .string()
    .trim()
    .min(1, 'Cantitatea este obligatorie')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: 'Introduce cantitatea in kg',
    }),
  observatii: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface AddRecoltareDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

const defaultValues = (): FormData => ({
  data: new Date().toISOString().split('T')[0],
  parcela_id: '',
  culegator_id: '',
  cantitate_kg: '',
  observatii: '',
})

export function AddRecoltareDialog({ open, onOpenChange, hideTrigger = false }: AddRecoltareDialogProps) {
  const queryClient = useQueryClient()
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = typeof open === 'boolean'
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues(),
  })

  useEffect(() => {
    if (!dialogOpen) {
      form.reset(defaultValues())
    }
  }, [dialogOpen, form])

  const { data: parcele = [] } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
  })

  const { data: culegatori = [] } = useQuery({
    queryKey: ['culegatori'],
    queryFn: getCulegatori,
  })

  const mutation = useMutation({
    mutationFn: createRecoltare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoltari'] })
      trackEvent('create_recoltare', { source: 'AddRecoltareDialog' })
      toast.success('Recoltare adaugata')
      setDialogOpen(false)
    },
    onError: (error: any) => {
      const conflict = error?.status === 409 || error?.code === '23505'
      if (conflict) {
        toast.info('Inregistrarea era deja sincronizata.')
        setDialogOpen(false)
        return
      }
      toast.error('Eroare la salvare')
    },
  })

  const onSubmit = (data: FormData) => {
    if (mutation.isPending) return

    mutation.mutate({
      data: data.data,
      parcela_id: data.parcela_id,
      culegator_id: data.culegator_id,
      cantitate_kg: Number(data.cantitate_kg),
      observatii: data.observatii?.trim() || undefined,
    })
  }

  return (
    <>
      {!hideTrigger ? (
        <Button onClick={() => setDialogOpen(true)} className="h-14 w-full rounded-xl font-semibold">
          + Recoltare
        </Button>
      ) : null}

      <AppDrawer
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Adauga recoltare"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="agri-cta" onClick={() => setDialogOpen(false)}>
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
            <Label htmlFor="recoltare_data">Data</Label>
            <Input id="recoltare_data" type="date" className="agri-control h-12" {...form.register('data')} />
            {form.formState.errors.data ? (
              <p className="text-xs text-red-600">{form.formState.errors.data.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoltare_parcela">Parcela</Label>
            <select
              id="recoltare_parcela"
              className="agri-control h-12 w-full px-3 text-base"
              {...form.register('parcela_id')}
            >
              <option value="">Selecteaza parcela</option>
              {parcele.map((parcela) => (
                <option key={parcela.id} value={parcela.id}>
                  {parcela.nume_parcela || 'Parcela'}
                </option>
              ))}
            </select>
            {form.formState.errors.parcela_id ? (
              <p className="text-xs text-red-600">{form.formState.errors.parcela_id.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoltare_culegator">Culegator</Label>
            <select
              id="recoltare_culegator"
              className="agri-control h-12 w-full px-3 text-base"
              {...form.register('culegator_id')}
            >
              <option value="">Selecteaza culegator</option>
              {culegatori.map((culegator) => (
                <option key={culegator.id} value={culegator.id}>
                  {culegator.nume_prenume || 'Culegator'}
                </option>
              ))}
            </select>
            {form.formState.errors.culegator_id ? (
              <p className="text-xs text-red-600">{form.formState.errors.culegator_id.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoltare_cantitate">Cantitate (kg)</Label>
            <Input
              id="recoltare_cantitate"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="agri-control h-12"
              {...form.register('cantitate_kg')}
            />
            {form.formState.errors.cantitate_kg ? (
              <p className="text-xs text-red-600">{form.formState.errors.cantitate_kg.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoltare_observatii">Observatii</Label>
            <Textarea
              id="recoltare_observatii"
              rows={4}
              placeholder="Detalii suplimentare"
              className="agri-control w-full px-3 py-2 text-base"
              {...form.register('observatii')}
            />
          </div>
        </form>
      </AppDrawer>
    </>
  )
}
