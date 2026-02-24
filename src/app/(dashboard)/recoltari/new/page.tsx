'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { createRecoltare } from '@/lib/supabase/queries/recoltari';
import { getParcele } from '@/lib/supabase/queries/parcele';
import { getCulegatori } from '@/lib/supabase/queries/culegatori';

const schema = z.object({
  data: z.string().min(1),
  parcela_id: z.string().min(1),
  culegator_id: z.string().min(1),
  cantitate_kg: z.preprocess(
    (val) => Number(val),
    z.number().positive('Introduce cantitatea în kg')
  ),
  observatii: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface NormalizedError {
  name?: string;
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
  raw?: unknown;
}

function normalizeError(e: unknown): NormalizedError {
  if (e && typeof e === 'object') {
    const err = e as Record<string, unknown>;

    if ('message' in err && typeof err.message === 'string') {
      return {
        name: typeof err.name === 'string' ? err.name : undefined,
        message: err.message,
        code: typeof err.code === 'string' ? err.code : undefined,
        details: typeof err.details === 'string' ? err.details : undefined,
        hint: typeof err.hint === 'string' ? err.hint : undefined,
        status: typeof err.status === 'number' ? err.status : undefined,
        raw: e,
      };
    }
  }

  if (e instanceof Error) {
    return {
      name: e.name,
      message: e.message,
      raw: e,
    };
  }

  return {
    message: 'Unknown error',
    raw: e,
  };
}

export default function NewRecoltarePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: parcele = [] } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
  });

  const { data: culegatori = [] } = useQuery({
    queryKey: ['culegatori'],
    queryFn: getCulegatori,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
    },
  });

  const cantitateKg = Number(watch('cantitate_kg') || 0);
  const culegatorId = watch('culegator_id');

  // Păstrăm calculul valorii muncii (opțional) dar fără caserole/tară
  const culegator = culegatori.find((c: { id: string }) => c.id === culegatorId);
  const tarif = (culegator as { tarif_lei_kg?: number } | undefined)?.tarif_lei_kg || 0;
  const valoare = cantitateKg * tarif;

  const mutation = useMutation({
    mutationFn: createRecoltare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoltari'] });
      toast.success('Recoltare adăugată!');
      router.back();
    },
    onError: (error: unknown) => {
      const normalized = normalizeError(error);

      console.error('Recoltare creation error:', {
        message: normalized.message,
        code: normalized.code,
        details: normalized.details,
        hint: normalized.hint,
        status: normalized.status,
        name: normalized.name,
      });

      const userMessage =
        normalized.message && normalized.message !== 'Unknown error'
          ? `Eroare: ${normalized.message}`
          : 'Eroare la salvarea recoltării';

      toast.error(userMessage);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      data: data.data,
      parcela_id: data.parcela_id,
      culegator_id: data.culegator_id,
      cantitate_kg: data.cantitate_kg,
      observatii: data.observatii,

      // Compatibilitate temporară cu schema veche (nr_caserole este NOT NULL în DB)
      nr_caserole: 1,
      tara_kg: 0,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 z-10">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-[#312E3F]">Adaugă Recoltare</h1>
      </div>

      {/* Form Content */}
      <div className="px-4 pt-4 pb-28 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                {...register('data')}
                className="w-full min-h-12 rounded-xl border border-gray-200 focus:ring-[#E5484D] focus:border-[#E5484D] px-4"
              />
              {errors.data && <p className="text-red-500 text-xs mt-1">{errors.data.message}</p>}
            </div>

            {/* Culegător */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Culegător</label>
              <select
                {...register('culegator_id')}
                autoFocus
                className="w-full min-h-12 rounded-xl border border-gray-200 focus:ring-[#E5484D] focus:border-[#E5484D] px-4"
              >
                <option value="">Selectează...</option>
                {culegatori.map((c: { id: string; nume_prenume: string; tarif_lei_kg?: number }) => (
                  <option key={c.id} value={c.id}>
                    {c.nume_prenume}
                    {typeof c.tarif_lei_kg === 'number' ? ` (${c.tarif_lei_kg} lei/kg)` : ''}
                  </option>
                ))}
              </select>
              {errors.culegator_id && (
                <p className="text-red-500 text-xs mt-1">{errors.culegator_id.message}</p>
              )}
            </div>

            {/* Parcelă */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parcelă</label>
              <select
                {...register('parcela_id')}
                className="w-full min-h-12 rounded-xl border border-gray-200 focus:ring-[#E5484D] focus:border-[#E5484D] px-4"
              >
                <option value="">Selectează...</option>
                {parcele.map((p: { id: string; id_parcela: string; nume_parcela?: string }) => (
                  <option key={p.id} value={p.id}>
                    {p.id_parcela}
                    {p.nume_parcela ? ` - ${p.nume_parcela}` : ''}
                  </option>
                ))}
              </select>
              {errors.parcela_id && (
                <p className="text-red-500 text-xs mt-1">{errors.parcela_id.message}</p>
              )}
            </div>

            {/* Cantitate (kg) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantitate (kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('cantitate_kg')}
                className="w-full min-h-12 rounded-xl border border-gray-200 focus:ring-[#E5484D] focus:border-[#E5484D] px-4"
              />
              {errors.cantitate_kg && (
                <p className="text-red-500 text-xs mt-1">{errors.cantitate_kg.message}</p>
              )}
            </div>

            {/* Observații */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observații</label>
              <textarea
                {...register('observatii')}
                rows={3}
                className="w-full rounded-xl border border-gray-200 focus:ring-[#E5484D] focus:border-[#E5484D] px-4 py-3"
              />
            </div>

            {/* Valoare muncă (opțional, simplu) */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Valoare muncă:</span>
                <span className="font-semibold text-[#E5484D]">
                  {Number.isFinite(valoare) ? valoare.toFixed(2) : '0.00'} lei
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={mutation.isPending}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-[#E5484D] to-[#F87171] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Se salvează...
            </>
          ) : (
            'Salvează Recoltare'
          )}
        </button>
      </div>
    </div>
  );
}