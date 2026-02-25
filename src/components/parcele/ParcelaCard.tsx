'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import type { Parcela } from '@/lib/supabase/queries/parcele';

interface ParcelaCardProps {
  parcela: Parcela;
  onEdit: () => void;
  onDelete: () => void;
}

export function ParcelaCard({ parcela, onEdit, onDelete }: ParcelaCardProps) {
  return (
    <Card className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant={parcela.status === 'Activ' ? 'default' : 'secondary'}
              className="rounded-lg text-xs"
            >
              {parcela.status ?? 'Nesetat'}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-gray-900">
            {parcela.nume_parcela}
          </h3>
          <p className="text-sm text-gray-600">{parcela.suprafata_m2} m²</p>
          {parcela.soi_plantat && (
            <p className="text-sm text-gray-600">Soi: {parcela.soi_plantat}</p>
          )}
          {parcela.observatii && (
            <p className="line-clamp-2 text-xs text-gray-400">{parcela.observatii}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            onClick={onEdit}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-gray-500 transition-all duration-150 hover:bg-gray-100 active:scale-95"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={onDelete}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-red-500 transition-all duration-150 hover:bg-gray-100 active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
