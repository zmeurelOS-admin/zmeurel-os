// src/components/investitii/EditInvestitieDialog.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  Investitie,
  updateInvestitie,
  CATEGORII_INVESTITII,
} from '@/lib/supabase/queries/investitii'

import { getParcele } from '@/lib/supabase/queries/parcele'

// ===============================
// VALIDATION
// ===============================

const investitieSchema = z.object({
  data: z.string().min(1, 'Data este obligatorie'),
  parcela_id: z.string().optional(),
  categorie: z.string().min(1, 'Categoria este obligatorie'),
  furnizor: z.string().optional(),
  descriere: z.string().optional(),
  suma_lei: z.string().min(1, 'Suma este obligatorie'),
})

type InvestitieFormData = z.infer<typeof investitieSchema>

interface EditInvestitieDialogProps {
  investitie: Investitie | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ===============================
// COMPONENT
// ===============================

export function EditInvestitieDialog({
  investitie,
  open,
  onOpenChange,
}: EditInvestitieDialogProps) {
  const queryClient = useQueryClient()

  const { data: parcele = [] } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvestitieFormData>({
    resolver: zodResolver(investitieSchema),
  })

  useEffect(() => {
    if (investitie && open) {
      reset({
        data: investitie.data.split('T')[0],
        parcela_id: investitie.parcela_id ?? '',
        categorie: investitie.categorie ?? '',
        furnizor: investitie.furnizor ?? '',
        descriere: investitie.descriere ?? '',
        suma_lei: investitie.suma_lei.toString(),
      })
    }
  }, [investitie, open, reset])

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: {
        data: string
        parcela_id?: string
        categorie: string
        furnizor?: string
        descriere?: string
        suma_lei: number
      }
    }) => updateInvestitie(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investitii'] })
      toast.success('Investiție actualizată cu succes!')
      onOpenChange(false)
    },
    onError: (error) => {
      console.error('Error updating investitie:', error)
      toast.error('Eroare la actualizarea investiției')
    },
  })

  const onSubmit = (data: InvestitieFormData) => {
    if (!investitie) return

    updateMutation.mutate({
      id: investitie.id,
      data: {
        data: data.data,
        parcela_id: data.parcela_id || undefined,
        categorie: data.categorie,
        furnizor: data.furnizor || undefined,
        descriere: data.descriere || undefined,
        suma_lei: Number(data.suma_lei),
      },
    })
  }

  if (!investitie) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>
            Editează Investiție: {investitie.id_investitie}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>Data</Label>
            <Input type="date" {...register('data')} />
          </div>

          <div>
            <Label>Categorie</Label>
            <select
              {...register('categorie')}
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option value="">Selectează categoria...</option>
              {CATEGORII_INVESTITII.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Parcelă</Label>
            <select
              {...register('parcela_id')}
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option value="">Fără legătură cu parcelă</option>
              {parcele.map((parcela: any) => (
                <option key={parcela.id} value={parcela.id}>
                  {parcela.id_parcela} - {parcela.nume_parcela}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Sumă (lei)</Label>
            <Input type="number" step="0.01" {...register('suma_lei')} />
          </div>

          <div>
            <Label>Furnizor</Label>
            <Input type="text" {...register('furnizor')} />
          </div>

          <div>
            <Label>Descriere</Label>
            <Textarea rows={2} {...register('descriere')} />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#F16B6B] hover:bg-[#E05A5A]"
            >
              {updateMutation.isPending
                ? 'Se salvează...'
                : 'Salvează'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
