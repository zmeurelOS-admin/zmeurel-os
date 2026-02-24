'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';

interface Parcela {
  id: string;
  id_parcela: string;
  nume_parcela: string;
  suprafata_m2: number;
  soi_plantat: string | null;
  an_plantare: number;
  nr_plante: number | null;
  status: string;
  gps_lat: number | null;
  gps_lng: number | null;
  observatii: string | null;
  created_at: string;
  updated_at: string;
}

interface ParcelaCardProps {
  parcela: Parcela;
  onEdit: () => void;
  onDelete: () => void;
}

export function ParcelaCard({ parcela, onEdit, onDelete }: ParcelaCardProps) {
  const varstaAni = new Date().getFullYear() - parcela.an_plantare;
  const densitateM2 =
    parcela.nr_plante && parcela.suprafata_m2 > 0
      ? parcela.nr_plante / parcela.suprafata_m2
      : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-mono">
                {parcela.id_parcela}
              </Badge>
              <Badge
                variant={parcela.status === 'Activ' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {parcela.status}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {parcela.nume_parcela}
            </h3>
          </div>
          <span className="text-3xl">🌱</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {parcela.soi_plantat && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍓</span>
            <span className="text-sm font-medium text-foreground">
              {parcela.soi_plantat}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Suprafață</div>
            <div className="text-lg font-bold text-foreground">
              {parcela.suprafata_m2} m²
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">An Plantare</div>
            <div className="text-lg font-bold text-foreground">
              {parcela.an_plantare}
              {varstaAni > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({varstaAni} {varstaAni === 1 ? 'an' : 'ani'})
                </span>
              )}
            </div>
          </div>

          {parcela.nr_plante && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Plante</div>
              <div className="text-lg font-bold text-foreground">
                {parcela.nr_plante}
              </div>
            </div>
          )}

          {parcela.nr_plante && parcela.suprafata_m2 > 0 && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Densitate</div>
              <div className="text-lg font-bold text-foreground">
                {densitateM2.toFixed(2)} pl/m²
              </div>
            </div>
          )}
        </div>

        {parcela.observatii && (
          <div className="text-sm text-muted-foreground italic border-l-2 border-border pl-3">
            {parcela.observatii}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Pencil className="h-5 w-5 mr-2" />
            Editează
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            size="sm"
            className="flex-1"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Șterge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}