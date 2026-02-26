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
import { generateClientId } from '@/lib/offline/generateClientId'
import { createActivitateAgricola } from '@/lib/supabase/queries/activitati-agricole'
import { getParcele } from '@/lib/supabase/queries/parcele'

const schema = z.object({
  data_aplicare: z.string().min(1, 'Data este obligatorie'),
  parcela_id: z.string().optional(),
  tip_activitate: z.string().min(1, 'Tipul activitatii este obligatoriu'),
  produs_utilizat: z.string().optional(),
  doza: z.string().optional(),
  timp_pauza_zile: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0), {
      message: 'Timpul de pauza trebuie sa fie un numar valid',
    }),
  observatii: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AddActivitateAgricolaDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

const defaults = (): FormValues => ({
  data_aplicare: new Date().toISOString().split('T')[0],
  parcela_id: '',
  tip_activitate: '',
  produs_utilizat: '',
  doza: '',
  timp_pauza_zile: '0',
  observatii: '',
})

export function AddActivitateAgricolaDialog({ open, onOpenChange, hideTrigger = false }: AddActivitateAgricolaDialogProps) {
  const queryClient = useQueryClient()
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = typeof open === 'boolean'
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults(),
  })

  useEffect(() => {
    if (!dialogOpen) form.reset(defaults())
  }, [dialogOpen, form])

  const { data: parcele = [] } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
  })

  const mutation = useMutation({
    mutationFn: createActivitateAgricola,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activitati'] })
      trackEvent('create_activitate', 'activitati', { source: 'AddActivitateAgricolaDialog' })
      toast.success('Activitate salvata')
      setDialogOpen(false)
    },
    onError: (error: any) => {
      const conflict = error?.status === 409 || error?.code === '23505'
      if (conflict) {
        toast.info('Inregistrarea era deja sincronizata')
        setDialogOpen(false)
        return
      }
      toast.error(error?.message || 'Eroare la salvare')
    },
  })

  const onSubmit = (values: FormValues) => {
    if (mutation.isPending) return

    mutation.mutate({
      client_sync_id: generateClientId(),
      data_aplicare: values.data_aplicare,
      parcela_id: values.parcela_id || undefined,
      tip_activitate: values.tip_activitate,
      produs_utilizat: values.produs_utilizat?.trim() || undefined,
      doza: values.doza?.trim() || undefined,
      timp_pauza_zile: Number(values.timp_pauza_zile || 0),
      observatii: values.observatii?.trim() || undefined,
    })
  }

  return (
    <>
      {!hideTrigger ? (
        <Button type="button" className="h-14 w-full rounded-xl font-semibold" onClick={() => setDialogOpen(true)}>
          + Activitate agricola
        </Button>
      ) : null}

      <AppDrawer
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Adauga activitate agricola"
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
            <Label htmlFor="act_data">Data aplicare</Label>
            <Input id="act_data" type="date" className="agri-control h-12" {...form.register('data_aplicare')} />
            {form.formState.errors.data_aplicare ? <p className="text-xs text-red-600">{form.formState.errors.data_aplicare.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="act_parcela">Parcela</Label>
            <select id="act_parcela" className="agri-control h-12 w-full px-3 text-base" {...form.register('parcela_id')}>
              <option value="">Selecteaza parcela</option>
              {parcele.map((parcela: any) => (
                <option key={parcela.id} value={parcela.id}>
                  {parcela.nume_parcela || 'Parcela'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="act_tip">Tip activitate</Label>
            <select id="act_tip" className="agri-control h-12 w-full px-3 text-base" {...form.register('tip_activitate')}>
              <option value="">Tip operatiune</option>
              <option value="fertilizare_foliara">Fertilizare foliara</option>
              <option value="fertirigare">Fertirigare</option>
              <option value="fertilizare_baza">Fertilizare de baza</option>
              <option value="fungicide_pesticide">Fungicide/Pesticide</option>
              <option value="irigatie">Irigatie</option>
              <option value="altele">Altele</option>
            </select>
            {form.formState.errors.tip_activitate ? <p className="text-xs text-red-600">{form.formState.errors.tip_activitate.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="act_produs">Produs</Label>
            <Input id="act_produs" className="agri-control h-12" placeholder="Ex: produs foliar" {...form.register('produs_utilizat')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="act_doza">Cantitate / doza</Label>
            <Input id="act_doza" className="agri-control h-12" placeholder="Ex: 2 l/ha" {...form.register('doza')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="act_pauza">Timp pauza (zile)</Label>
            <Input id="act_pauza" type="number" min="0" className="agri-control h-12" {...form.register('timp_pauza_zile')} />
            {form.formState.errors.timp_pauza_zile ? <p className="text-xs text-red-600">{form.formState.errors.timp_pauza_zile.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="act_obs">Observatii</Label>
            <Textarea id="act_obs" rows={4} className="agri-control w-full px-3 py-2 text-base" {...form.register('observatii')} />
          </div>
        </form>
      </AppDrawer>
    </>
  )
}
