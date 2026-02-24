'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createRecoltare } from '@/lib/supabase/queries/recoltari';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const schema = z.object({
  data: z.string().min(1),
  parcela_id: z.string().min(1),
  culegator_id: z.string().min(1),
  cantitate_kg: z
    .number()
    .refine((v) => Number.isFinite(v) && v > 0, 'Introduce cantitatea în kg'),
  observatii: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function AddRecoltareDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: createRecoltare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoltari'] });
      toast.success('Recoltare adăugată');
      setOpen(false);
      reset({ data: new Date().toISOString().split('T')[0] });
    },
    onError: () => {
      toast.error('Eroare la salvare');
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      data: data.data,
      parcela_id: data.parcela_id,
      culegator_id: data.culegator_id,
      cantitate_kg: data.cantitate_kg,
      observatii: data.observatii,
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="w-full h-14 rounded-xl font-semibold"
      >
        + Recoltare
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adaugă Recoltare</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" {...register('data')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parcela_id">Parcelă ID</Label>
              <Input id="parcela_id" {...register('parcela_id')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="culegator_id">Culegător ID</Label>
              <Input id="culegator_id" {...register('culegator_id')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantitate_kg">Cantitate (kg)</Label>
              <Input
                id="cantitate_kg"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('cantitate_kg', { valueAsNumber: true })}
              />
              {errors.cantitate_kg && (
                <p className="text-sm text-destructive">
                  {errors.cantitate_kg.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observatii">Observații</Label>
              <Textarea
                id="observatii"
                placeholder="Observații"
                {...register('observatii')}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={mutation.isPending}
              >
                Anulează
              </Button>
              <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                {mutation.isPending ? 'Se salvează...' : 'Salvează'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}