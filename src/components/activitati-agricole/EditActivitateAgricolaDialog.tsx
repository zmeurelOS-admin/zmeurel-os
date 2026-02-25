'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { AppDialog } from '@/components/app/AppDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getParcele } from '@/lib/supabase/queries/parcele'
import {
  type ActivitateAgricola,
  updateActivitateAgricola,
} from '@/lib/supabase/queries/activitati-agricole'

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

interface EditActivitateAgricolaDialogProps {
  activitate: ActivitateAgricola | null
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function EditActivitateAgricolaDialog({
  activitate,
  open,
  onOpenChange,
}: EditActivitateAgricolaDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults(),
  })

  useEffect(() => {
    if (!open || !activitate) return

    form.reset({
      data_aplicare: activitate.data_aplicare
        ? new Date(activitate.data_aplicare).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      parcela_id: activitate.parcela_id ?? '',
      tip_activitate: activitate.tip_activitate ?? '',
      produs_utilizat: activitate.produs_utilizat ?? '',
      doza: activitate.doza ?? '',
      timp_pauza_zile:
        typeof activitate.timp_pauza_zile === 'number' ? String(activitate.timp_pauza_zile) : '0',
      observatii: activitate.observatii ?? '',
    })
  }, [open, activitate, form])

  const { data: parcele = [] } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
  })

  const mutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) =>
      updateActivitateAgricola(id, {
        data_aplicare: values.data_aplicare,
        parcela_id: values.parcela_id || undefined,
        tip_activitate: values.tip_activitate,
        produs_utilizat: values.produs_utilizat?.trim() || undefined,
        doza: values.doza?.trim() || undefined,
        timp_pauza_zile: Number(values.timp_pauza_zile || 0),
        observatii: values.observatii?.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activitati'] })
      toast.success('Activitate actualizata')
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Eroare la actualizare')
    },
  })

  if (!activitate) return null

  const submit = (values: FormValues) => {
    if (mutation.isPending) return
    mutation.mutate({ id: activitate.id, values })
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editeaza activitate agricola"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="agri-cta" onClick={() => onOpenChange(false)}>
            Anuleaza
          </Button>
          <Button
            type="button"
            className="agri-cta bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
            onClick={form.handleSubmit(submit)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salveaza'}
          </Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
        <div className="space-y-2">
          <Label htmlFor="act_edit_data">Data aplicare</Label>
          <Input id="act_edit_data" type="date" className="agri-control h-12" {...form.register('data_aplicare')} />
          {form.formState.errors.data_aplicare ? <p className="text-xs text-red-600">{form.formState.errors.data_aplicare.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="act_edit_parcela">Parcela</Label>
          <select id="act_edit_parcela" className="agri-control h-12 w-full px-3 text-base" {...form.register('parcela_id')}>
            <option value="">Selecteaza parcela</option>
            {parcele.map((parcela: any) => (
              <option key={parcela.id} value={parcela.id}>
                {parcela.nume_parcela || 'Parcela'}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="act_edit_tip">Tip activitate</Label>
          <select id="act_edit_tip" className="agri-control h-12 w-full px-3 text-base" {...form.register('tip_activitate')}>
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
          <Label htmlFor="act_edit_produs">Produs</Label>
          <Input id="act_edit_produs" className="agri-control h-12" {...form.register('produs_utilizat')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="act_edit_doza">Cantitate / doza</Label>
          <Input id="act_edit_doza" className="agri-control h-12" {...form.register('doza')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="act_edit_pauza">Timp pauza (zile)</Label>
          <Input id="act_edit_pauza" type="number" min="0" className="agri-control h-12" {...form.register('timp_pauza_zile')} />
          {form.formState.errors.timp_pauza_zile ? <p className="text-xs text-red-600">{form.formState.errors.timp_pauza_zile.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="act_edit_obs">Observatii</Label>
          <Textarea id="act_edit_obs" rows={4} className="agri-control w-full px-3 py-2 text-base" {...form.register('observatii')} />
        </div>
      </form>
    </AppDialog>
  )
}
