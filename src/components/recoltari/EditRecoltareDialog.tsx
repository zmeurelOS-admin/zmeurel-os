'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateRecoltare, Recoltare } from '@/lib/supabase/queries/recoltari'

interface Props {
  recoltare: Recoltare | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface EditFormData {
  data: string
  cantitate_kg: number
}

export function EditRecoltareDialog({
  recoltare,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset } = useForm<EditFormData>()

  useEffect(() => {
    if (recoltare) {
      reset({
        data: recoltare.data,
        cantitate_kg: recoltare.cantitate_kg,
      })
    }
  }, [recoltare, reset])

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { data?: string; cantitate_kg?: number } }) =>
      updateRecoltare(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoltari'] })
      onOpenChange(false)
    },
  })

  const onSubmit = (data: EditFormData) => {
    if (!recoltare) return
    mutation.mutate({
      id: recoltare.id,
      data: {
        data: data.data,
        cantitate_kg: Number(data.cantitate_kg),
      },
    })
  }

  if (!recoltare) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Editează Recoltare</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <Input type="date" {...register('data')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantitate (kg)</label>
            <Input type="number" step="0.01" min="0" {...register('cantitate_kg')} />
          </div>
          <Button type="submit">Salvează</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}