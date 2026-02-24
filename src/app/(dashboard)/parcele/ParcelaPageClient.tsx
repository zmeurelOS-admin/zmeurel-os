'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getParcele,
  createParcela,
  updateParcela,
  deleteParcela,
  type Parcela,
} from '@/lib/supabase/queries/parcele';
import { AddParcelaDialog } from '@/components/parcele/AddParcelaDialog';

interface ParcelaFormData {
  nume_parcela: string;
  suprafata_m2: number | string;
  soi_plantat?: string;
  an_plantare: number | string;
  nr_plante?: number | string;
  status: string;
  gps_lat?: number | string;
  gps_lng?: number | string;
  observatii?: string;
}

interface ParcelaPageClientProps {
  initialParcele: Parcela[];
}

export function ParcelaPageClient({
  initialParcele,
}: ParcelaPageClientProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: parcele = initialParcele, isLoading } = useQuery({
    queryKey: ['parcele'],
    queryFn: () => getParcele(),
    initialData: initialParcele,
  });

  const createMutation = useMutation({
    mutationFn: (data: ParcelaFormData) =>
      createParcela({
        nume_parcela: data.nume_parcela,
        suprafata_m2: Number(data.suprafata_m2),
        soi_plantat: data.soi_plantat || null,
        an_plantare: Number(data.an_plantare),
        nr_plante: data.nr_plante ? Number(data.nr_plante) : null,
        status: data.status,
        gps_lat: data.gps_lat ? Number(data.gps_lat) : null,
        gps_lng: data.gps_lng ? Number(data.gps_lng) : null,
        observatii: data.observatii || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcele'] });
      toast.success('Parcelă adăugată');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ParcelaFormData;
    }) =>
      updateParcela(id, {
        nume_parcela: payload.nume_parcela,
        suprafata_m2: Number(payload.suprafata_m2),
        soi_plantat: payload.soi_plantat || null,
        an_plantare: Number(payload.an_plantare),
        nr_plante: payload.nr_plante
          ? Number(payload.nr_plante)
          : null,
        status: payload.status,
        gps_lat: payload.gps_lat ? Number(payload.gps_lat) : null,
        gps_lng: payload.gps_lng ? Number(payload.gps_lng) : null,
        observatii: payload.observatii || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcele'] });
      toast.success('Parcelă actualizată');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteParcela(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcele'] });
      toast.success('Parcelă ștearsă');
    },
  });

  const filtered = parcele.filter((p) =>
    p.nume_parcela.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden lg:block" style={{ padding: 24 }}>
        <h1>Parcele</h1>

        <input
          placeholder="Caută parcelă..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, marginBottom: 16, width: 300 }}
        />

        {isLoading && <p>Se încarcă...</p>}

        {!isLoading &&
          filtered.map((p) => (
            <div
              key={p.id}
              style={{
                border: '1px solid #ddd',
                padding: 12,
                marginBottom: 8,
                borderRadius: 6,
              }}
            >
              <div>
                <strong>{p.nume_parcela}</strong>
              </div>

              <div>{p.suprafata_m2} m²</div>

              <div>Status: {p.status}</div>

              <button
                onClick={() => deleteMutation.mutate(p.id)}
                style={{ marginTop: 8 }}
              >
                Delete
              </button>
            </div>
          ))}

        <div style={{ marginTop: 16 }}>
          <AddParcelaDialog
            soiuriDisponibile={['Delniwa', 'Maravilla', 'Enrosadira', 'Husaria']}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['parcele'] });
            }}
          />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden space-y-4 pb-24">
        <input
          placeholder="Caută parcelă..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 text-base rounded-xl border border-slate-300 px-4"
        />

        <div className="w-full">
          <AddParcelaDialog
            soiuriDisponibile={['Delniwa', 'Maravilla', 'Enrosadira', 'Husaria']}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['parcele'] });
            }}
          />
        </div>

        {isLoading && <p className="text-center text-slate-600">Se încarcă...</p>}

        {!isLoading &&
          filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl shadow-md p-4 bg-white"
            >
              <div className="text-lg font-bold text-slate-900">
                {p.nume_parcela}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {p.suprafata_m2} m²
              </div>
              <div className="text-sm text-slate-600">
                Status: {p.status}
              </div>
              {p.soi_plantat && (
                <div className="text-sm text-slate-600">
                  Soi: {p.soi_plantat}
                </div>
              )}
              <button
                onClick={() => deleteMutation.mutate(p.id)}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
              >
                Șterge
              </button>
            </div>
          ))}
      </div>
    </>
  );
}