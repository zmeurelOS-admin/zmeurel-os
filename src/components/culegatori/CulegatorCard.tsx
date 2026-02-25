// src/components/culegatori/CulegatorCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, User, Phone, Calendar, Briefcase, Coins } from 'lucide-react';
import type { Culegator } from '@/lib/supabase/queries/culegatori';

interface CulegatorCardProps {
  culegator: Culegator;
  onEdit: (culegator: Culegator) => void;
  onDelete: (id: string, name: string) => void;
}

export function CulegatorCard({ culegator, onEdit, onDelete }: CulegatorCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {culegator.nume_prenume}
              </CardTitle>
            </div>
          </div>
          
          {/* Status badge */}
          <Badge
            style={{
              backgroundColor: culegator.status_activ ? '#10b981' : '#6b7280',
              color: 'white',
            }}
          >
            {culegator.status_activ ? 'Activ' : 'Inactiv'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Telefon */}
        {culegator.telefon && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <a 
              href={`tel:${culegator.telefon}`}
              className="hover:text-primary"
            >
              {culegator.telefon}
            </a>
          </div>
        )}

        {/* Tip angajare */}
        {culegator.tip_angajare && (
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{culegator.tip_angajare}</span>
          </div>
        )}

        {/* Tarif */}
        <div className="flex items-center gap-2 text-sm">
          <Coins className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-green-600">
            {culegator.tarif_lei_kg} lei/kg
          </span>
          {culegator.tarif_lei_kg === 0 && (
            <span className="text-xs text-muted-foreground">(salarizat fix)</span>
          )}
        </div>

        {/* Data angajare */}
        {culegator.data_angajare && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {new Date(culegator.data_angajare).toLocaleDateString('ro-RO')}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(culegator)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editează
          </Button>
          <Button
            variant="outline"
            size="sm"
            style={{ color: '#ef4444', borderColor: '#ef4444' }}
            onClick={() => onDelete(culegator.id, culegator.nume_prenume)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
