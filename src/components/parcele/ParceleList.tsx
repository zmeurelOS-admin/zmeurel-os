'use client'

import { MapPin, Pencil, Sprout } from 'lucide-react'

import { StatusChip } from '@/components/app/StatusChip'
import type { Parcela } from '@/lib/supabase/queries/parcele'
import { Button } from '@/components/ui/button'

interface ParceleListProps {
  parcele: Parcela[]
  onEdit: (parcela: Parcela) => void
  onDelete: (parcela: Parcela) => void
  parcelProfitMap?: Record<string, { profit: number; margin: number }>
}

export function ParceleList({ parcele, onEdit, onDelete, parcelProfitMap }: ParceleListProps) {
  return (
    <div className="space-y-3">
      {parcele.map((parcela) => (
        <article key={parcela.id} className="agri-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--agri-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--agri-text-muted)]">
                <MapPin className="h-3.5 w-3.5" />
                Parcela
              </div>
              <h3 className="text-lg font-semibold text-[var(--agri-text)]">{parcela.nume_parcela}</h3>
              <p className="text-sm text-[var(--agri-text-muted)]">{parcela.suprafata_m2} m2</p>
              {parcelProfitMap?.[parcela.id] ? (
                <div
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    parcelProfitMap[parcela.id].profit >= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  Profit: {parcelProfitMap[parcela.id].profit.toFixed(0)} lei ({parcelProfitMap[parcela.id].margin.toFixed(1)}%)
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--agri-text-muted)]">
                <StatusChip status={parcela.status ?? 'programat'} size="lg" />
                {parcela.soi_plantat ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--agri-border)] px-2 py-1">
                    <Sprout className="h-3.5 w-3.5" />
                    {parcela.soi_plantat}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="agri-control h-11 rounded-xl px-4"
                onClick={() => onEdit(parcela)}
              >
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                className="agri-control h-11 rounded-xl border-red-200 px-4 text-red-700"
                onClick={() => onDelete(parcela)}
              >
                Sterge
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
