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
import { getClienti } from '@/lib/supabase/queries/clienti'
import { getParcele } from '@/lib/supabase/queries/parcele'
import {
  type UpdateVanzareButasiInput,
  type VanzareButasi,
  updateVanzareButasi,
} from '@/lib/supabase/queries/vanzari-butasi'

interface EditVanzareButasiDialogProps {
  vanzare: VanzareButasi | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface EditFormValues {
  data: string
  client_id: string
  parcela_sursa_id: string
  soi_butasi: string
  cantitate_butasi: number
  pret_unitar_lei: number
  observatii: string
}

export function EditVanzareButasiDialog({ vanzare, open, onOpenChange }: EditVanzareButasiDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<EditFormValues>({
    defaultValues: {
      data: '',
      client_id: '',
      parcela_sursa_id: '',
      soi_butasi: '',
      cantitate_butasi: 0,
      pret_unitar_lei: 0,
      observatii: '',
    },
  })

  useEffect(() => {
    if (vanzare && open) {
      form.reset({
        data: vanzare.data,
        client_id: vanzare.client_id ?? '',
        parcela_sursa_id: vanzare.parcela_sursa_id ?? '',
        soi_butasi: vanzare.soi_butasi,
        cantitate_butasi: vanzare.cantitate_butasi,
        pret_unitar_lei: vanzare.pret_unitar_lei,
        observatii: vanzare.observatii ?? '',
      })
    }
  }, [vanzare, open, form])

  const { data: clienti = [] } = useQuery({
    queryKey: ['clienti'],
    queryFn: getClienti,
  })

  const { data: parcele = [] } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVanzareButasiInput }) => updateVanzareButasi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vanzari-butasi'] })
      toast.success('Vanzare actualizata')
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Eroare la actualizare')
    },
  })

  const onSubmit = (values: EditFormValues) => {
    if (!vanzare || updateMutation.isPending) return

    updateMutation.mutate({
      id: vanzare.id,
      input: {
        data: values.data,
        client_id: values.client_id || null,
        parcela_sursa_id: values.parcela_sursa_id || null,
        soi_butasi: values.soi_butasi.trim(),
        cantitate_butasi: Number(values.cantitate_butasi),
        pret_unitar_lei: Number(values.pret_unitar_lei),
        observatii: values.observatii?.trim() || null,
      },
    })
  }

  if (!vanzare) return null

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editeaza vanzare butasi"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="agri-cta" onClick={() => onOpenChange(false)}>
            Anuleaza
          </Button>
          <Button
            type="button"
            className="agri-cta bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salveaza'}
          </Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="edit_vb_data">Data</Label>
          <Input id="edit_vb_data" type="date" className="agri-control h-12" {...form.register('data')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_vb_soi">Soi butasi</Label>
          <Input id="edit_vb_soi" className="agri-control h-12" {...form.register('soi_butasi')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="edit_vb_qty">Cantitate</Label>
            <Input
              id="edit_vb_qty"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min="1"
              className="agri-control h-12"
              {...form.register('cantitate_butasi', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_vb_pret">Pret/buc (lei)</Label>
            <Input
              id="edit_vb_pret"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              className="agri-control h-12"
              {...form.register('pret_unitar_lei', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_vb_client">Client</Label>
          <select id="edit_vb_client" className="agri-control h-12 w-full px-3 text-base" {...form.register('client_id')}>
            <option value="">Fara client</option>
            {clienti.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nume_client}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_vb_parcela">Parcela sursa</Label>
          <select id="edit_vb_parcela" className="agri-control h-12 w-full px-3 text-base" {...form.register('parcela_sursa_id')}>
            <option value="">Fara parcela</option>
            {parcele.map((parcela) => (
              <option key={parcela.id} value={parcela.id}>
                {parcela.nume_parcela}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_vb_obs">Observatii</Label>
          <Textarea id="edit_vb_obs" rows={4} className="agri-control w-full px-3 py-2 text-base" {...form.register('observatii')} />
        </div>
      </form>
    </AppDialog>
  )
}
