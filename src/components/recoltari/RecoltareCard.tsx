// src/components/recoltari/RecoltareCard.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar, User, Package, DollarSign, AlertTriangle, Info } from 'lucide-react';
import { StatusChip } from '@/components/app/StatusChip';
import { SyncBadge } from '@/components/app/SyncBadge';
import { Recoltare } from '@/lib/supabase/queries/recoltari';

interface RecoltareCardProps {
  recoltare: Recoltare;
  culegatorNume?: string;
  culegatorTarif?: number;
  parcelaNume?: string;
  onEdit: (recoltare: Recoltare) => void;
  onDelete: (recoltare: Recoltare) => void;
}

function getLotStatus(recoltare: Recoltare): 'programat' | 'in_lucru' | 'finalizat' | 'anulat' {
  if (recoltare.cantitate_kg <= 0) return 'anulat';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recoltareDate = new Date(recoltare.data);
  recoltareDate.setHours(0, 0, 0, 0);

  if (recoltareDate > today) return 'programat';
  if (recoltareDate.getTime() === today.getTime()) return 'in_lucru';
  return 'finalizat';
}

export function RecoltareCard({
  recoltare,
  culegatorNume,
  culegatorTarif,
  parcelaNume,
  onEdit,
  onDelete,
}: RecoltareCardProps) {
  const recoltareWithMeta = recoltare as Recoltare & {
    sync_status?: string | null
    created_by?: string | null
    conflict_flag?: boolean | null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatAuditDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatUser = (id?: string | null) => {
    if (!id) return 'necunoscut';
    return `${id.slice(0, 8)}...`;
  };

  const valoareMuncaLei = culegatorTarif ? recoltare.cantitate_kg * culegatorTarif : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">Recoltare</span>
              <StatusChip status={getLotStatus(recoltare)} size="sm" />
              <SyncBadge status={recoltareWithMeta.sync_status} />
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-white"
                title={`Creat de ${formatUser(recoltareWithMeta.created_by)} la ${formatAuditDate(recoltare.created_at)}\nModificat la ${formatAuditDate(recoltare.updated_at)}`}
              >
                <Info className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mb-1 flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(recoltare.data)}</span>
            </div>

            {recoltare.culegator_id && culegatorNume ? (
              <div className="mb-1 flex items-center gap-1.5 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{culegatorNume}</span>
              </div>
            ) : null}

            {recoltare.parcela_id && parcelaNume ? (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>{parcelaNume}</span>
              </div>
            ) : null}
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(recoltare)} className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(recoltare)}
              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <div className="text-center">
            <div className="mb-1 text-xs text-gray-600">Cantitate (kg)</div>
            <div className="text-2xl font-bold text-blue-700">{formatNumber(recoltare.cantitate_kg)}</div>
          </div>
        </div>

        {culegatorTarif && culegatorTarif > 0 ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3">
            <DollarSign className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <div className="mb-0.5 text-xs text-gray-600">Valoare munca ({formatNumber(culegatorTarif)} lei/kg)</div>
              <div className="text-2xl font-bold text-red-600">-{formatNumber(valoareMuncaLei)} lei</div>
            </div>
          </div>
        ) : null}

        {culegatorTarif === 0 ? (
          <div className="mb-2 text-sm text-gray-600">Culegator salarizat fix (fara tarif/kg)</div>
        ) : null}

        {recoltareWithMeta.conflict_flag ? (
          <div className="mb-2 rounded-lg border border-red-300 bg-red-50 p-2 text-sm font-semibold text-red-800">
            <span className="inline-flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Conflict detectat
            </span>
          </div>
        ) : null}

        {recoltare.observatii ? (
          <div className="mt-2 border-t pt-2 text-sm text-gray-600">{recoltare.observatii}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
