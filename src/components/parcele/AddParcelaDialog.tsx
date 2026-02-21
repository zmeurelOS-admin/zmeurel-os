'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const parcelaSchema = z.object({
  nume_parcela: z.string().min(1, 'Numele parcelei este obligatoriu'),
  suprafata_m2: z.string().min(1, 'Suprafata este obligatorie'),
  soi_plantat: z.string().optional(),
  an_plantare: z.string().min(1, 'Anul plantarii este obligatoriu'),
  nr_plante: z.string().optional(),
  observatii: z.string().optional(),
});

type ParcelaFormData = z.infer<typeof parcelaSchema>;

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
      observatii: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ParcelaFormData) => {
      const supabase = createClient();

      const nextId = `P${Date.now()}`;

      const { data: result, error: insertError } = await supabase
        .from('parcele')
        .insert({
          id_parcela: nextId,
          nume_parcela: data.nume_parcela,
          suprafata_m2: Number(data.suprafata_m2),
          soi_plantat: data.soi_plantat || null,
          an_plantare: Number(data.an_plantare),
          nr_plante: data.nr_plante ? Number(data.nr_plante) : null,
          status: 'Activ',
          gps_lat: null,
          gps_lng: null,
          observatii: data.observatii || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcele'] });
      toast.success('Parcela a fost adaugata cu succes!');
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
        <Button size="lg" className="bg-[#F16B6B] hover:bg-[#ef4444] min-h-12">
          <Plus className="h-5 w-5 mr-2" />
          Adauga Parcela
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adauga Parcela Noua</DialogTitle>
          <DialogDescription>
            Completeaza detaliile parcelei. ID-ul se va genera automat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nume_parcela">Nume Parcela *</Label>
            <Input id="nume_parcela" {...form.register('nume_parcela')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suprafata_m2">Suprafata (m2) *</Label>
            <Input id="suprafata_m2" type="number" {...form.register('suprafata_m2')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="soi_plantat">Soi Plantat</Label>
            <select id="soi_plantat" {...form.register('soi_plantat')}>
              <option value="">Selecteaza soi...</option>
              {soiuriDisponibile.map((soi, index) => (
                <option key={`${soi}-${index}`} value={soi}>
                  {soi}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="an_plantare">An Plantare *</Label>
            <Input id="an_plantare" type="number" {...form.register('an_plantare')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nr_plante">Numar Plante</Label>
            <Input id="nr_plante" type="number" {...form.register('nr_plante')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observatii">Observatii</Label>
            <Textarea id="observatii" {...form.register('observatii')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anuleaza
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se salveaza...
                </>
              ) : (
                'Salveaza Parcela'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
