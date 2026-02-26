'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

import { AppDialog } from '@/components/app/AppDialog';
import { Button } from '@/components/ui/button';
import { createParcela } from '@/lib/supabase/queries/parcele';
import { ParcelaForm, type ParcelaFormData } from './ParcelaForm';

const parcelaSchema = z.object({
  nume_parcela: z.string().min(1, 'Numele parcelei este obligatoriu'),
  suprafata_m2: z.string().min(1, 'Suprafata este obligatorie'),
  soi_plantat: z.string().optional(),
  an_plantare: z.string().min(1, 'Anul plantarii este obligatoriu'),
  nr_plante: z.string().optional(),
  status: z.string().default('Activ'),
  observatii: z.string().optional(),
});

interface AddParcelaDialogProps {
  soiuriDisponibile: string[];
  onSuccess: () => void;
}

export function AddParcelaDialog({ soiuriDisponibile, onSuccess }: AddParcelaDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ParcelaFormData>({
    resolver: zodResolver(parcelaSchema),
    defaultValues: {
      nume_parcela: '',
      suprafata_m2: '',
      soi_plantat: '',
      an_plantare: String(new Date().getFullYear()),
      nr_plante: '',
      status: 'Activ',
      observatii: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ParcelaFormData) => {
      const idParcela = `PAR-${Date.now().toString().slice(-6)}`;
      return createParcela({
        id_parcela: idParcela,
        nume_parcela: data.nume_parcela,
        suprafata_m2: Number(data.suprafata_m2),
        soi_plantat: data.soi_plantat || undefined,
        an_plantare: Number(data.an_plantare),
        nr_plante: data.nr_plante ? Number(data.nr_plante) : undefined,
        status: data.status,
        observatii: data.observatii || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcele'] });
      toast.success('Parcela a fost adaugata cu succes');
      form.reset();
      setOpen(false);
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Eroare: ${error.message}`);
    },
  });

  const onSubmit = (data: ParcelaFormData) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Button size="lg" className="h-14 w-full rounded-2xl shadow-sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-5 w-5" />
        Adauga Parcela
      </Button>

      <AppDialog
        open={open}
        onOpenChange={setOpen}
        title="Adauga Parcela Noua"
        description="Completeaza detaliile parcelei. ID-ul se genereaza automat."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createMutation.isPending}>
              Anuleaza
            </Button>
            <Button type="submit" form="add-parcela-form" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Se salveaza...
                </>
              ) : (
                'Salveaza Parcela'
              )}
            </Button>
          </>
        }
      >
        <form id="add-parcela-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ParcelaForm form={form} soiuriDisponibile={soiuriDisponibile} />
        </form>
      </AppDialog>
    </>
  );
}
