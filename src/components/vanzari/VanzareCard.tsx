// src/components/vanzari/VanzareCard.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar, User, DollarSign, Package, AlertTriangle, Info } from 'lucide-react';
import { SyncBadge } from '@/components/app/SyncBadge';
import { Vanzare } from '@/lib/supabase/queries/vanzari';

interface VanzareCardProps {
  vanzare: Vanzare;
  clientNume?: string;
  onEdit: (vanzare: Vanzare) => void;
  onDelete: (vanzare: Vanzare) => void;
}

export function VanzareCard({
  vanzare,
  clientNume,
  onEdit,
  onDelete,
}: VanzareCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatSuma = (suma: number) => {
    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(suma);
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

  const valoareTotala = vanzare.cantitate_kg * vanzare.pret_lei_kg;

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Platit':
      case 'Plătit':
        return 'bg-green-100 text-green-800';
      case 'Restanta':
      case 'Restanță':
        return 'bg-red-100 text-red-800';
      case 'Avans':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">Vanzare</span>
              <span className={`rounded-md px-2 py-1 text-xs font-medium ${getBadgeColor(vanzare.status_plata)}`}>
                {vanzare.status_plata}
              </span>
              <SyncBadge status={vanzare.sync_status} />
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-white"
                title={`Creat de ${formatUser(vanzare.created_by)} la ${formatAuditDate(vanzare.created_at)}\nModificat la ${formatAuditDate(vanzare.updated_at)}`}
              >
                <Info className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mb-1 flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(vanzare.data)}</span>
            </div>

            {vanzare.client_id && clientNume ? (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Client: {clientNume}</span>
              </div>
            ) : null}
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(vanzare)} className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(vanzare)}
              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="text-sm">
            <span className="text-gray-600">Cantitate:</span>{' '}
            <span className="font-medium text-gray-900">{formatSuma(vanzare.cantitate_kg)} kg</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Pret/kg:</span>{' '}
            <span className="font-medium text-gray-900">{formatSuma(vanzare.pret_lei_kg)} lei</span>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-3">
          <DollarSign className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <div className="mb-0.5 text-xs text-gray-600">Valoare totala</div>
            <div className="text-2xl font-bold text-green-600">+{formatSuma(valoareTotala)} lei</div>
          </div>
        </div>

        {vanzare.conflict_flag ? (
          <div className="mb-2 rounded-lg border border-red-300 bg-red-50 p-2 text-sm font-semibold text-red-800">
            <span className="inline-flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Conflict detectat
            </span>
          </div>
        ) : null}

        {vanzare.observatii_ladite ? (
          <div className="mt-2 flex items-start gap-2 border-t pt-2 text-sm text-gray-600">
            <Package className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <span className="font-medium">Ladite:</span> {vanzare.observatii_ladite}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
