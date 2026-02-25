'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { updateParcela, type Parcela } from '@/lib/supabase/queries/parcele'
import { AppDialog } from '@/components/app/AppDialog'
import { Button } from '@/components/ui/button'
import {
  getParcelFormDefaults,
  parcelFormSchema,
  ParcelForm,
  type ParcelFormValues,
} from '@/components/parcele/ParcelForm'

interface EditParcelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parcela: Parcela | null
  soiuriDisponibile: string[]
  onSaved: () => void
}

const toFormValues = (parcela: Parcela): ParcelFormValues => ({
  nume_parcela: parcela.nume_parcela ?? '',
  tip_fruct: parcela.tip_fruct ?? '',
  suprafata_m2: String(parcela.suprafata_m2 ?? ''),
  soi_plantat: parcela.soi_plantat ?? '',
  an_plantare: String(parcela.an_plantare ?? ''),
  nr_plante: parcela.nr_plante ? String(parcela.nr_plante) : '',
  status: parcela.status ?? 'Activ',
  observatii: parcela.observatii ?? '',
})

const toDecimal = (value: string) => Number(value.replace(',', '.').trim())

export function EditParcelDialog({
  open,
  onOpenChange,
  parcela,
  soiuriDisponibile,
  onSaved,
}: EditParcelDialogProps) {
  const form = useForm<ParcelFormValues>({
    resolver: zodResolver(parcelFormSchema),
    defaultValues: getParcelFormDefaults(),
  })

  useEffect(() => {
    if (open && parcela) {
      form.reset(toFormValues(parcela))
    }
  }, [open, parcela, form])

  const updateMutation = useMutation({
    mutationFn: async (values: ParcelFormValues) => {
      if (!parcela) throw new Error('Parcela lipsa')

      return updateParcela(parcela.id, {
        nume_parcela: values.nume_parcela.trim(),
        tip_fruct: values.tip_fruct || null,
        suprafata_m2: toDecimal(values.suprafata_m2),
        soi_plantat: values.soi_plantat || null,
        an_plantare: Number(values.an_plantare),
        nr_plante: values.nr_plante ? Number(values.nr_plante) : null,
        status: values.status,
        observatii: values.observatii || null,
      })
    },
    onSuccess: () => {
      toast.success('Parcela actualizata')
      onOpenChange(false)
      onSaved()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  if (!parcela) return null

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editeaza parcela"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="agri-cta" onClick={() => onOpenChange(false)}>
            Anuleaza
          </Button>
          <Button
            type="button"
            className="agri-cta bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
            onClick={form.handleSubmit((values) => updateMutation.mutate(values))}
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salveaza'}
          </Button>
        </div>
      }
    >
      <ParcelForm form={form} soiuriDisponibile={soiuriDisponibile} />
    </AppDialog>
  )
}
