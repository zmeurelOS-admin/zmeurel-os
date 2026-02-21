// src/components/vanzari-butasi/AddVanzareButasiDialog.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { createVanzareButasi } from '@/lib/supabase/queries/vanzari-butasi';
import { getClienti } from '@/lib/supabase/queries/clienti';
import { getParcele } from '@/lib/supabase/queries/parcele';

// ===============================
// VALIDATION
// ===============================

const vanzareButasiSchema = z.object({
  data: z.string().min(1, 'Data este obligatorie'),
  client_id: z.string().optional(),
  parcela_sursa_id: z.string().optional(),
  soi_butasi: z.string().min(1, 'Soiul este obligatoriu'),
  cantitate_butasi: z.string().min(1, 'Cantitatea este obligatorie'),
  pret_unitar_lei: z.string().min(1, 'Prețul este obligatoriu'),
  observatii: z.string().optional(),
});

type VanzareButasiFormData = z.infer<typeof vanzareButasiSchema>;

// ===============================
// COMPONENT (RLS-FIRST)
// ===============================

export function AddVanzareButasiDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // RLS-first queries
  const { data: clienti = [] } = useQuery({
    queryKey: ['clienti'],
    queryFn: getClienti,
  });

  const { data: parcele = [] } = useQuery({
    queryKey: ['parcele'],
    queryFn: getParcele,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VanzareButasiFormData>({
    resolver: zodResolver(vanzareButasiSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      client_id: '',
      parcela_sursa_id: '',
      soi_butasi: '',
      cantitate_butasi: '',
      pret_unitar_lei: '',
      observatii: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: createVanzareButasi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vanzari-butasi'] });
      toast.success('Vânzare butași adăugată cu succes!');
      reset();
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error creating vanzare butasi:', error);
      toast.error('Eroare la adăugarea vânzării');
    },
  });

  const onSubmit = (data: VanzareButasiFormData) => {
    createMutation.mutate({
      data: data.data,
      client_id: data.client_id || undefined,
      parcela_sursa_id: data.parcela_sursa_id || undefined,
      soi_butasi: data.soi_butasi,
      cantitate_butasi: Number(data.cantitate_butasi),
      pret_unitar_lei: Number(data.pret_unitar_lei),
      observatii: data.observatii || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#F16B6B] hover:bg-[#E05A5A]">
          <Plus className="h-4 w-4 mr-2" />
          Adaugă Vânzare Butași
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[75vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Adaugă Vânzare Butași Nouă</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

          <div>
            <Label>Data</Label>
            <Input type="date" {...register('data')} />
          </div>

          <div>
            <Label>Soi butași</Label>
            <Input {...register('soi_butasi')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cantitate</Label>
              <Input type="number" {...register('cantitate_butasi')} />
            </div>
            <div>
              <Label>Preț/buc (lei)</Label>
              <Input type="number" step="0.01" {...register('pret_unitar_lei')} />
            </div>
          </div>

          <div>
            <Label>Client</Label>
            <select {...register('client_id')} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-white">
              <option value="">Fără client</option>
              {clienti.map((client: any) => (
                <option key={client.id} value={client.id}>
                  {client.id_client} - {client.nume_client}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Parcelă sursă</Label>
            <select {...register('parcela_sursa_id')} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-white">
              <option value="">Fără parcelă</option>
              {parcele.map((parcela: any) => (
                <option key={parcela.id} value={parcela.id}>
                  {parcela.id_parcela} - {parcela.nume_parcela}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Observații</Label>
            <Textarea rows={2} {...register('observatii')} />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Se salvează...' : 'Salvează'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
