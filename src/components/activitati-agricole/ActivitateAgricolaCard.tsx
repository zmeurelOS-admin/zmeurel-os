// src/components/activitati-agricole/ActivitateAgricolaCard.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar, Package, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { SyncBadge } from '@/components/app/SyncBadge';
import { ActivitateAgricola, calculatePauseStatus } from '@/lib/supabase/queries/activitati-agricole';

interface ActivitateAgricolaCardProps {
  activitate: ActivitateAgricola;
  parcelaNume?: string;
  onEdit: (activitate: ActivitateAgricola) => void;
  onDelete: (activitate: ActivitateAgricola) => void;
}

export function ActivitateAgricolaCard({
  activitate,
  parcelaNume,
  onEdit,
  onDelete,
}: ActivitateAgricolaCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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

  const { dataRecoltarePermisa, status } = calculatePauseStatus(
    activitate.data_aplicare,
    activitate.timp_pauza_zile
  );

  const getBadgeColor = (tip: string) => {
    if (tip.includes('Fungicid')) return 'bg-purple-100 text-purple-800';
    if (tip.includes('Insecticid')) return 'bg-red-100 text-red-800';
    if (tip.includes('Erbicid')) return 'bg-orange-100 text-orange-800';
    if (tip.includes('Fertilizare')) return 'bg-green-100 text-green-800';
    if (tip.includes('Irigare')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">{activitate.id_activitate}</span>
              <span className={`rounded-md px-2 py-1 text-xs font-medium ${getBadgeColor(activitate.tip_activitate || '')}`}>
                {activitate.tip_activitate || 'Altele'}
              </span>
              <SyncBadge status={activitate.sync_status} />
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-white"
                title={`Creat de ${formatUser(activitate.created_by)} la ${formatAuditDate(activitate.created_at)}\nModificat la ${formatAuditDate(activitate.updated_at)}`}
              >
                <Info className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mb-1 flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Aplicat: {formatDate(activitate.data_aplicare)}</span>
            </div>

            {activitate.parcela_id && parcelaNume ? (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>{parcelaNume}</span>
              </div>
            ) : null}
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(activitate)} className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(activitate)}
              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {activitate.produs_utilizat ? (
          <div className="mb-2 text-sm">
            <span className="text-gray-600">Produs:</span>{' '}
            <span className="font-medium text-gray-900">{activitate.produs_utilizat}</span>
            {activitate.doza ? ` (${activitate.doza})` : ''}
          </div>
        ) : null}

        {activitate.operator ? (
          <div className="mb-3 text-sm text-gray-600">Operator: {activitate.operator}</div>
        ) : null}

        {activitate.timp_pauza_zile > 0 ? (
          <div
            className={`mb-3 rounded-lg border p-3 ${
              status === 'OK' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              {status === 'OK' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <div className="flex-1">
                <div
                  className={`text-sm font-medium ${
                    status === 'OK' ? 'text-green-800' : 'text-yellow-800'
                  }`}
                >
                  Status: {status}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              <div>Timp pauza: {activitate.timp_pauza_zile} zile</div>
              <div>Recoltare permisa de la: {formatDate(dataRecoltarePermisa)}</div>
            </div>
          </div>
        ) : null}

        {activitate.conflict_flag ? (
          <div className="mb-2 rounded-lg border border-red-300 bg-red-50 p-2 text-sm font-semibold text-red-800">
            <span className="inline-flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Conflict detectat
            </span>
          </div>
        ) : null}

        {activitate.observatii ? (
          <div className="mt-2 border-t pt-2 text-sm text-gray-600">{activitate.observatii}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
