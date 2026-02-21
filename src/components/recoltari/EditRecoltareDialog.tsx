'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateRecoltare, Recoltare } from '@/lib/supabase/queries/recoltari'

interface Props {
  recoltare: Recoltare | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRecoltareDialog({
  recoltare,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (recoltare) {
      reset({
        data: recoltare.data,
        nr_caserole: recoltare.nr_caserole,
      })
    }
  }, [recoltare, reset])

  const mutation = useMutation({
    mutationFn: ({ id, data }: any) =>
      updateRecoltare(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoltari'] })
      onOpenChange(false)
    },
  })

  const onSubmit = (data: any) => {
    if (!recoltare) return
    mutation.mutate({
      id: recoltare.id,
      data,
    })
  }

  if (!recoltare) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input type="date" {...register('data')} />
          <Input type="number" {...register('nr_caserole')} />
          <Button type="submit">Salvează</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
