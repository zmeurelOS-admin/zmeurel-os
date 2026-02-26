'use client'

import { Pencil, Sprout, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Parcela } from '@/lib/supabase/queries/parcele'

interface ParcelaCardProps {
  parcela: Parcela
  onEdit: () => void
  onDelete: () => void
}

export function ParcelaCard({ parcela, onEdit, onDelete }: ParcelaCardProps) {
  return (
    <Card className="rounded-2xl border border-[var(--agri-border)] shadow-sm">
      <CardContent className="p-5 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[var(--agri-text)]">{parcela.nume_parcela || 'Parcela'}</h3>
            <p className="text-xs text-[var(--agri-text-muted)]">{parcela.id_parcela || 'ID parcela indisponibil'}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-red-700 hover:bg-red-50 hover:text-red-800" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2.5 text-sm">
            <p><span className="font-medium text-[var(--agri-text-muted)]">Tip cultura:</span> {parcela.tip_fruct || '-'}</p>
            <p><span className="font-medium text-[var(--agri-text-muted)]">Soi:</span> {parcela.soi_plantat || '-'}</p>
            <p><span className="font-medium text-[var(--agri-text-muted)]">An plantare:</span> {parcela.an_plantare || '-'}</p>
            <p><span className="font-medium text-[var(--agri-text-muted)]">Nr plante:</span> {parcela.nr_plante || '-'}</p>
            <p><span className="font-medium text-[var(--agri-text-muted)]">Suprafata:</span> {Number(parcela.suprafata_m2 || 0).toFixed(0)} m2</p>
          </div>

          <div className="relative flex min-h-[180px] flex-col rounded-xl border border-[var(--agri-border)] bg-[var(--agri-surface-muted)] p-4">
            <p className="mb-2 text-sm font-semibold text-[var(--agri-text)]">Stropiri active</p>
            <p className="text-xs text-[var(--agri-text-muted)]">
              TODO: datele de stropiri active nu sunt conectate in acest ecran.
            </p>

            <div className="mt-4 space-y-1">
              <p className="text-sm font-semibold text-[var(--agri-text)]">Timp pauza activ</p>
              <p className="text-sm font-medium text-[var(--agri-text-muted)]">Nedisponibil (TODO conexiune activitati_agricole)</p>
            </div>

            <div className="mt-auto flex justify-end pt-3">
              <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700">
                Date REI indisponibile
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
