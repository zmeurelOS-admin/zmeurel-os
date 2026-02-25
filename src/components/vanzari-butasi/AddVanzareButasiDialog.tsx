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
import { getClienti } from '@/lib/supabase/queries/clienti'
import { getParcele } from '@/lib/supabase/queries/parcele'
import { createVanzareButasi } from '@/lib/supabase/queries/vanzari-butasi'

const vanzareButasiSchema = z.object({
  data: z.string().min(1, 'Data este obligatorie'),
  client_id: z.string().optional(),
  parcela_sursa_id: z.string().optional(),
  soi_butasi: z.string().min(1, 'Soiul este obligatoriu'),
  cantitate_butasi: z
    .string()
    .trim()
    .min(1, 'Cantitatea este obligatorie')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: 'Cantitatea trebuie sa fie mai mare ca 0',
    }),
  pret_unitar_lei: z
    .string()
    .trim()
    .min(1, 'Pretul este obligatoriu')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: 'Pretul trebuie sa fie mai mare ca 0',
    }),
  observatii: z.string().optional(),
})

type VanzareButasiFormData = z.infer<typeof vanzareButasiSchema>

interface AddVanzareButasiDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

const defaults = (): VanzareButasiFormData => ({
  data: new Date().toISOString().split('T')[0],
  client_id: '',
  parcela_sursa_id: '',
  soi_butasi: '',
  cantitate_butasi: '',
  pret_unitar_lei: '',
  observatii: '',
})

export function AddVanzareButasiDialog({ open, onOpenChange, hideTrigger = false }: AddVanzareButasiDialogProps) {
  const queryClient = useQueryClient()
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = typeof open === 'boolean'
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  const form = useForm<VanzareButasiFormData>({
    resolver: zodResolver(vanzareButasiSchema),
    defaultValues: defaults(),
  })

  useEffect(() => {
    if (!dialogOpen) form.reset(defaults())
  }, [dialogOpen, form])

  const { data: clienti = [] } = useQuery({
    queryKey: ['clienti'],
    queryFn: getClienti,
  })

  const { data: parcele = [] } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
  })

  const createMutation = useMutation({
    mutationFn: createVanzareButasi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vanzari-butasi'] })
      toast.success('Vanzare butasi adaugata')
      setDialogOpen(false)
    },
    onError: (error) => {
      console.error('Error creating vanzare butasi:', error)
      toast.error('Eroare la adaugarea vanzarii')
    },
  })

  const onSubmit = (data: VanzareButasiFormData) => {
    if (createMutation.isPending) return

    createMutation.mutate({
      data: data.data,
      client_id: data.client_id || undefined,
      parcela_sursa_id: data.parcela_sursa_id || undefined,
      soi_butasi: data.soi_butasi,
      cantitate_butasi: Number(data.cantitate_butasi),
      pret_unitar_lei: Number(data.pret_unitar_lei),
      observatii: data.observatii?.trim() || undefined,
    })
  }

  return (
    <>
      {!hideTrigger ? (
        <Button type="button" className="h-14 w-full rounded-xl font-semibold" onClick={() => setDialogOpen(true)}>
          + Vanzare butasi
        </Button>
      ) : null}

      <AppDrawer
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Adauga vanzare butasi"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="agri-cta" onClick={() => setDialogOpen(false)}>
              Anuleaza
            </Button>
            <Button
              type="button"
              className="agri-cta bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
              onClick={form.handleSubmit(onSubmit)}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salveaza'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="vb_data">Data</Label>
            <Input id="vb_data" type="date" className="agri-control h-12" {...form.register('data')} />
            {form.formState.errors.data ? <p className="text-xs text-red-600">{form.formState.errors.data.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vb_soi">Soi butasi</Label>
            <Input id="vb_soi" className="agri-control h-12" placeholder="Ex: Delniwa" {...form.register('soi_butasi')} />
            {form.formState.errors.soi_butasi ? <p className="text-xs text-red-600">{form.formState.errors.soi_butasi.message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="vb_qty">Cantitate</Label>
              <Input id="vb_qty" type="number" min="1" className="agri-control h-12" {...form.register('cantitate_butasi')} />
              {form.formState.errors.cantitate_butasi ? <p className="text-xs text-red-600">{form.formState.errors.cantitate_butasi.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vb_price">Pret/buc (lei)</Label>
              <Input id="vb_price" type="number" step="0.01" min="0.01" className="agri-control h-12" {...form.register('pret_unitar_lei')} />
              {form.formState.errors.pret_unitar_lei ? <p className="text-xs text-red-600">{form.formState.errors.pret_unitar_lei.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vb_client">Client</Label>
            <select id="vb_client" className="agri-control h-12 w-full px-3 text-base" {...form.register('client_id')}>
              <option value="">Fara client</option>
              {clienti.map((client: any) => (
                <option key={client.id} value={client.id}>
                  {client.nume_client}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vb_parcela">Parcela sursa</Label>
            <select id="vb_parcela" className="agri-control h-12 w-full px-3 text-base" {...form.register('parcela_sursa_id')}>
              <option value="">Fara parcela</option>
              {parcele.map((parcela: any) => (
                <option key={parcela.id} value={parcela.id}>
                  {parcela.nume_parcela}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vb_obs">Observatii</Label>
            <Textarea id="vb_obs" rows={4} className="agri-control w-full px-3 py-2 text-base" {...form.register('observatii')} />
          </div>
        </form>
      </AppDrawer>
    </>
  )
}
