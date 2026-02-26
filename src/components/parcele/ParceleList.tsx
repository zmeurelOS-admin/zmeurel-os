'use client'

import { Pencil, Sprout, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Parcela } from '@/lib/supabase/queries/parcele'

interface ParceleListProps {
  parcele: Parcela[]
  onEdit: (parcela: Parcela) => void
  onDelete: (parcela: Parcela) => void
  parcelProfitMap?: Record<string, { profit: number; margin: number }>
  parcelPauseMap?: Record<string, { remainingDays: number; products: string[] }>
}

export function ParceleList({ parcele, onEdit, onDelete, parcelProfitMap, parcelPauseMap }: ParceleListProps) {
  return (
    <div className="space-y-4">
      {parcele.map((parcela) => {
        const rei = parcelPauseMap?.[parcela.id]
        const hasActiveRei = !!rei && rei.remainingDays > 0
        const sprayProducts = rei?.products ?? []

        return (
          <Card key={parcela.id} className="rounded-2xl border border-[var(--agri-border)] shadow-sm">
            <CardContent className="p-5 md:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[var(--agri-text)]">{parcela.nume_parcela || 'Parcela'}</h3>
                  <p className="text-xs text-[var(--agri-text-muted)]">{parcela.id_parcela || 'ID parcela indisponibil'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => onEdit(parcela)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => onDelete(parcela)}>
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
                  {parcelProfitMap?.[parcela.id] ? (
                    <p className="text-xs text-[var(--agri-text-muted)]">
                      Profit: {parcelProfitMap[parcela.id].profit.toFixed(0)} lei ({parcelProfitMap[parcela.id].margin.toFixed(1)}%)
                    </p>
                  ) : null}
                </div>

                <div className="relative flex min-h-[180px] flex-col rounded-xl border border-[var(--agri-border)] bg-[var(--agri-surface-muted)] p-4">
                  <p className="mb-2 text-sm font-semibold text-[var(--agri-text)]">Stropiri active</p>
                  {sprayProducts.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {sprayProducts.map((product) => (
                        <Badge key={product} variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                          <Sprout className="h-3 w-3" />
                          {product}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--agri-text-muted)]">Nu exista stropiri active in perioada de pauza.</p>
                  )}

                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-semibold text-[var(--agri-text)]">Timp pauza activ</p>
                    {hasActiveRei ? (
                      <p className="text-sm font-medium text-red-700">Activ - restrictionare recoltare</p>
                    ) : (
                      <p className="text-sm font-medium text-emerald-700">Inactiv</p>
                    )}
                  </div>

                  <div className="mt-auto flex justify-end pt-3">
                    {hasActiveRei ? (
                      <Badge className="bg-red-600 text-white hover:bg-red-600">{rei.remainingDays} zile ramase</Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">OK la recoltare</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
