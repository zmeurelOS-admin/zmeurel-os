// src/components/investitii/AddInvestitieDialog.tsx
'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'

import {
  createInvestitie,
  CATEGORII_INVESTITII,
} from '@/lib/supabase/queries/investitii'

import { getParcele } from '@/lib/supabase/queries/parcele'

const investitieSchema = z.object({
  data: z.string().min(1, 'Data este obligatorie'),
  parcela_id: z.string().optional(),
  categorie: z.string().min(1, 'Categoria este obligatorie'),
  furnizor: z.string().optional(),
  descriere: z.string().optional(),
  suma_lei: z.string().min(1, 'Suma este obligatorie'),
})

type InvestitieFormData = z.infer<typeof investitieSchema>

interface AddInvestitieDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

export function AddInvestitieDialog({ open, onOpenChange, hideTrigger = false }: AddInvestitieDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = typeof open === 'boolean'
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

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
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      parcela_id: '',
      categorie: '',
      furnizor: '',
      descriere: '',
      suma_lei: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: createInvestitie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investitii'] })
      toast.success('Investitie adaugata cu succes!')
      reset()
      setDialogOpen(false)
    },
    onError: (error) => {
      console.error('Error creating investitie:', error)
      toast.error('Eroare la adaugarea investitiei')
    },
  })

  const onSubmit = (data: InvestitieFormData) => {
    createMutation.mutate({
      data: data.data,
      parcela_id: data.parcela_id || undefined,
      categorie: data.categorie,
      furnizor: data.furnizor || undefined,
      descriere: data.descriere || undefined,
      suma_lei: Number(data.suma_lei),
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!hideTrigger ? (
        <DialogTrigger asChild>
          <Button className="bg-[#F16B6B] hover:bg-[#E05A5A]">
            <Plus className="h-4 w-4 mr-2" />
            Adauga Investitie
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent
        className="max-w-md max-h-[75vh] overflow-y-auto"
        style={{ backgroundColor: 'white' }}
      >
        <DialogHeader>
          <DialogTitle>Adauga Investitie Noua (CAPEX)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="data" className="text-sm">
              Data investitiei <span className="text-red-500">*</span>
            </Label>
            <Input
              id="data"
              type="date"
              {...register('data')}
              className={errors.data ? 'border-red-500' : ''}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="categorie" className="text-sm">
              Categorie investitie <span className="text-red-500">*</span>
            </Label>
            <select
              id="categorie"
              {...register('categorie')}
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${
                errors.categorie ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: 'white' }}
            >
              <option value="">Selecteaza categoria...</option>
              {CATEGORII_INVESTITII.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="parcela_id" className="text-sm">
              Parcela
            </Label>
            <select
              id="parcela_id"
              {...register('parcela_id')}
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              style={{ backgroundColor: 'white' }}
            >
              <option value="">Fara legatura cu parcela</option>
              {parcele.map((parcela: any) => (
                <option key={parcela.id} value={parcela.id}>
                  {parcela.nume_parcela || 'Parcela'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="suma_lei" className="text-sm">
              Suma investita (lei) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="suma_lei"
              type="number"
              step="0.01"
              {...register('suma_lei')}
              className={errors.suma_lei ? 'border-red-500' : ''}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="furnizor" className="text-sm">
              Furnizor
            </Label>
            <Input id="furnizor" type="text" {...register('furnizor')} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="descriere" className="text-sm">
              Descriere
            </Label>
            <Textarea id="descriere" rows={2} {...register('descriere')} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                setDialogOpen(false)
              }}
            >
              Anuleaza
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-[#F16B6B] hover:bg-[#E05A5A]"
            >
              {createMutation.isPending ? 'Se salveaza...' : 'Salveaza'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
