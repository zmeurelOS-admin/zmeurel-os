'use client'

import type { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { NumericField } from '@/components/app/NumericField'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export interface ParcelFormValues {
  nume_parcela: string
  tip_fruct: string
  suprafata_m2: string
  soi_plantat: string
  an_plantare: string
  nr_plante: string
  status: string
  observatii: string
}

const toDecimal = (value: string) => Number(value.replace(',', '.').trim())

export const parcelFormSchema = z.object({
  nume_parcela: z.string().trim().min(1, 'Numele parcelei este obligatoriu'),
  tip_fruct: z.string().trim().min(1, 'Tipul culturii este obligatoriu'),
  suprafata_m2: z
    .string()
    .trim()
    .min(1, 'Suprafata este obligatorie')
    .refine((value) => Number.isFinite(toDecimal(value)) && toDecimal(value) > 0, {
      message: 'Suprafata trebuie sa fie un numar valid',
    }),
  soi_plantat: z.string(),
  an_plantare: z
    .string()
    .trim()
    .min(1, 'Anul plantarii este obligatoriu')
    .refine((value) => Number.isInteger(Number(value)), {
      message: 'Anul plantarii trebuie sa fie un numar intreg',
    }),
  nr_plante: z.string().trim().refine((value) => !value || Number.isInteger(Number(value)), {
    message: 'Numarul de plante trebuie sa fie un numar intreg',
  }),
  status: z.string().trim().min(1, 'Statusul este obligatoriu'),
  observatii: z.string(),
})

export const getParcelFormDefaults = (): ParcelFormValues => ({
  nume_parcela: '',
  tip_fruct: '',
  suprafata_m2: '',
  soi_plantat: '',
  an_plantare: String(new Date().getFullYear()),
  nr_plante: '',
  status: 'Activ',
  observatii: '',
})

interface ParcelFormProps {
  form: UseFormReturn<ParcelFormValues>
  soiuriDisponibile: string[]
}

const selectTriggerClass = 'agri-control h-12 w-full px-3 text-base'

const CULTURI = ['zmeure', 'mure', 'afine', 'coacaze', 'aronia', 'catina'] as const

const SOIURI_PE_CULTURA: Record<(typeof CULTURI)[number], string[]> = {
  zmeure: ['Delniwa', 'Maravilla', 'Enrosadira', 'Husaria', 'Polka', 'Heritage'],
  mure: ['Chester', 'Loch Ness', 'Triple Crown', 'Navaho'],
  afine: ['Duke', 'Bluecrop', 'Elliott', 'Legacy'],
  coacaze: ['Rovada', 'Jonkheer', 'Titania', 'Ben Lomond'],
  aronia: ['Nero', 'Viking', 'Galicjanka'],
  catina: ['Clara', 'Mara', 'Serpenta', 'Cora'],
}

const CULTURA_LABELS: Record<(typeof CULTURI)[number], string> = {
  zmeure: 'Zmeură',
  mure: 'Mure',
  afine: 'Afine',
  coacaze: 'Coacăze',
  aronia: 'Aronia',
  catina: 'Cătină',
}

export function ParcelForm({ form, soiuriDisponibile }: ParcelFormProps) {
  const tipFruct = form.watch('tip_fruct')
  const soiuriPentruTip = tipFruct && tipFruct in SOIURI_PE_CULTURA
    ? SOIURI_PE_CULTURA[tipFruct as keyof typeof SOIURI_PE_CULTURA]
    : []
  const soiuriFinale = soiuriPentruTip.length > 0 ? soiuriPentruTip : soiuriDisponibile

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nume_parcela">Nume parcela</Label>
        <input
          id="nume_parcela"
          className="agri-control h-12 w-full px-3 text-base"
          placeholder="Parcela Nord"
          {...form.register('nume_parcela')}
        />
        {form.formState.errors.nume_parcela ? (
          <p className="text-xs text-red-600">{form.formState.errors.nume_parcela.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Tip cultura</Label>
        <Select
          value={form.watch('tip_fruct')}
          onValueChange={(value) => {
            form.setValue('tip_fruct', value, { shouldDirty: true, shouldValidate: true })
            const currentSoi = form.getValues('soi_plantat')
            const allowed = SOIURI_PE_CULTURA[value as keyof typeof SOIURI_PE_CULTURA] ?? []
            if (currentSoi && !allowed.includes(currentSoi)) {
              form.setValue('soi_plantat', '', { shouldDirty: true, shouldValidate: true })
            }
          }}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Alege tip cultura" />
          </SelectTrigger>
          <SelectContent>
            {CULTURI.map((cultura) => (
              <SelectItem key={cultura} value={cultura}>
                {CULTURA_LABELS[cultura]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.tip_fruct ? (
          <p className="text-xs text-red-600">{form.formState.errors.tip_fruct.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Soi plantat</Label>
        <Select
          value={form.watch('soi_plantat')}
          onValueChange={(value) => form.setValue('soi_plantat', value, { shouldDirty: true })}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder={tipFruct ? 'Alege soi' : 'Selecteaza mai intai tipul culturii'} />
          </SelectTrigger>
          <SelectContent>
            {soiuriFinale.map((soi) => (
              <SelectItem key={soi} value={soi}>
                {soi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <NumericField
        id="suprafata_m2"
        label="Suprafata (m2)"
        placeholder="1200"
        {...form.register('suprafata_m2')}
        error={form.formState.errors.suprafata_m2?.message}
      />

      <NumericField
        id="an_plantare"
        label="An plantare"
        placeholder={String(new Date().getFullYear())}
        {...form.register('an_plantare')}
        error={form.formState.errors.an_plantare?.message}
      />

      <NumericField
        id="nr_plante"
        label="Numar plante"
        placeholder="0"
        {...form.register('nr_plante')}
        error={form.formState.errors.nr_plante?.message}
      />

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={form.watch('status')}
          onValueChange={(value) => form.setValue('status', value, { shouldDirty: true })}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Alege status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Activ">Activ</SelectItem>
            <SelectItem value="Inactiv">Inactiv</SelectItem>
            <SelectItem value="In Pregatire">In Pregatire</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observatii">Observatii</Label>
        <Textarea
          id="observatii"
          rows={4}
          placeholder="Detalii suplimentare"
          className="agri-control w-full px-3 py-2 text-base"
          {...form.register('observatii')}
        />
      </div>
    </div>
  )
}
