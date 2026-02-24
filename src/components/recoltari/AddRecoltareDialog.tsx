'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createRecoltare } from '@/lib/supabase/queries/recoltari';

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

      // compat temporar DB
      nr_caserole: 1,
      tara_kg: 0,
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full h-14 rounded-xl bg-gradient-to-r from-[#E5484D] to-[#F87171] text-white font-semibold"
      >
        + Recoltare
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Adaugă Recoltare</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="date"
            {...register('data')}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Parcelă ID"
            {...register('parcela_id')}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Culegător ID"
            {...register('culegator_id')}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            type="number"
            step="0.01"
            {...register('cantitate_kg', { valueAsNumber: true })}
            placeholder="Cantitate kg"
            className="w-full border rounded-xl px-4 py-3"
          />
          {errors.cantitate_kg && (
            <p className="text-red-500 text-sm">
              {errors.cantitate_kg.message}
            </p>
          )}

          <textarea
            {...register('observatii')}
            placeholder="Observații"
            className="w-full border rounded-xl px-4 py-3"
          />

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-12 rounded-xl bg-[#E5484D] text-white font-semibold"
          >
            {mutation.isPending ? 'Se salvează...' : 'Salvează'}
          </button>
        </form>
      </div>
    </div>
  );
}