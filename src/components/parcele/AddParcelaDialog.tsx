'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import { createParcela } from '@/lib/supabase/queries/parcele';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ParcelaForm, type ParcelaFormData } from './ParcelaForm';

const parcelaSchema = z.object({
  nume_parcela: z.string().min(1, 'Numele parcelei este obligatoriu'),
  suprafata_m2: z.string().min(1, 'Suprafața este obligatorie'),
  soi_plantat: z.string().optional(),
  an_plantare: z.string().min(1, 'Anul plantării este obligatoriu'),
  nr_plante: z.string().optional(),
  status: z.string().default('Activ'),
  observatii: z.string().optional(),
});

interface AddParcelaDialogProps {
  soiuriDisponibile: string[];
  onSuccess: () => void;
}

export function AddParcelaDialog({
  soiuriDisponibile,
  onSuccess,
}: AddParcelaDialogProps) {
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
      return createParcela({
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
      toast.success('Parcela a fost adăugată cu succes!');
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full h-14 rounded-2xl shadow-sm">
          <Plus className="h-5 w-5 mr-2" />
          Adaugă Parcelă
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adaugă Parcelă Nouă</DialogTitle>
          <DialogDescription>
            Completează detaliile parcelei. ID-ul se va genera automat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ParcelaForm form={form} soiuriDisponibile={soiuriDisponibile} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Anulează
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Se salvează...
                </>
              ) : (
                'Salvează Parcela'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}