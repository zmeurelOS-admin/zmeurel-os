'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { createParcela } from '@/lib/supabase/queries/parcele'
import { AppDrawer } from '@/components/app/AppDrawer'
import { Button } from '@/components/ui/button'
import {
  getParcelFormDefaults,
  parcelFormSchema,
  ParcelForm,
  type ParcelFormValues,
} from '@/components/parcele/ParcelForm'

interface AddParcelDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  soiuriDisponibile: string[]
  onCreated: () => void
}

const toDecimal = (value: string) => Number(value.replace(',', '.').trim())
const generateParcelCode = () => `PAR-${Date.now().toString().slice(-6)}`

export function AddParcelDrawer({
  open,
  onOpenChange,
  soiuriDisponibile,
  onCreated,
}: AddParcelDrawerProps) {
  const form = useForm<ParcelFormValues>({
    resolver: zodResolver(parcelFormSchema),
    defaultValues: getParcelFormDefaults(),
  })

  useEffect(() => {
    if (!open) {
      form.reset(getParcelFormDefaults())
    }
  }, [open, form])

  const createMutation = useMutation({
    mutationFn: async (values: ParcelFormValues) =>
      createParcela({
        id_parcela: generateParcelCode(),
        nume_parcela: values.nume_parcela.trim(),
        tip_fruct: values.tip_fruct,
        suprafata_m2: toDecimal(values.suprafata_m2),
        soi_plantat: values.soi_plantat || undefined,
        an_plantare: Number(values.an_plantare),
        nr_plante: values.nr_plante ? Number(values.nr_plante) : undefined,
        status: values.status,
        observatii: values.observatii || undefined,
      }),
    onSuccess: () => {
      toast.success('Parcela adaugata')
      onOpenChange(false)
      onCreated()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Adauga parcela"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="agri-cta" onClick={() => onOpenChange(false)}>
            Anuleaza
          </Button>
          <Button
            type="button"
            className="agri-cta bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
            onClick={form.handleSubmit((values) => createMutation.mutate(values))}
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salveaza'}
          </Button>
        </div>
      }
    >
      <ParcelForm form={form} soiuriDisponibile={soiuriDisponibile} />
    </AppDrawer>
  )
}
