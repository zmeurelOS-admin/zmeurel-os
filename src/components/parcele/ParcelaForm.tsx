'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ParcelaFormData {
  nume_parcela: string;
  suprafata_m2: string;
  soi_plantat?: string;
  an_plantare: string;
  nr_plante?: string;
  status?: string;
  observatii?: string;
}

interface ParcelaFormProps {
  form: UseFormReturn<ParcelaFormData>;
  soiuriDisponibile: string[];
}

export function ParcelaForm({ form, soiuriDisponibile }: ParcelaFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nume_parcela">Nume Parcelă *</Label>
        <Input
          id="nume_parcela"
          placeholder="ex: Parcela Nord"
          {...form.register('nume_parcela')}
        />
        {form.formState.errors.nume_parcela && (
          <p className="text-sm text-destructive">
            {form.formState.errors.nume_parcela.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="suprafata_m2">Suprafață (m²) *</Label>
        <Input
          id="suprafata_m2"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...form.register('suprafata_m2')}
        />
        {form.formState.errors.suprafata_m2 && (
          <p className="text-sm text-destructive">
            {form.formState.errors.suprafata_m2.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="soi_plantat">Soi Plantat</Label>
        <Select
          value={form.watch('soi_plantat')}
          onValueChange={(value) => form.setValue('soi_plantat', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selectează soi..." />
          </SelectTrigger>
          <SelectContent>
            {soiuriDisponibile.map((soi) => (
              <SelectItem key={soi} value={soi}>
                {soi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="an_plantare">An Plantare *</Label>
        <Input
          id="an_plantare"
          type="number"
          min="2000"
          max={new Date().getFullYear()}
          placeholder={String(new Date().getFullYear())}
          {...form.register('an_plantare')}
        />
        {form.formState.errors.an_plantare && (
          <p className="text-sm text-destructive">
            {form.formState.errors.an_plantare.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nr_plante">Număr Plante</Label>
        <Input
          id="nr_plante"
          type="number"
          placeholder="0"
          {...form.register('nr_plante')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={form.watch('status')}
          onValueChange={(value) => form.setValue('status', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Activ">Activ</SelectItem>
            <SelectItem value="Inactiv">Inactiv</SelectItem>
            <SelectItem value="În Pregătire">În Pregătire</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observatii">Observații</Label>
        <Textarea
          id="observatii"
          placeholder="Detalii suplimentare..."
          {...form.register('observatii')}
        />
      </div>
    </div>
  );
}