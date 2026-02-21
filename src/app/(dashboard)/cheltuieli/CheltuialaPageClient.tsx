'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getCheltuieli,
  createCheltuiala,
  updateCheltuiala,
  deleteCheltuiala,
  type Cheltuiala,
} from '@/lib/supabase/queries/cheltuieli';

interface CheltuialaFormData {
  data: string;
  categorie: string;
  suma_lei: number | string;
  furnizor?: string;
  descriere?: string;
}

interface CheltuialaPageClientProps {
  initialCheltuieli: Cheltuiala[];
}

export function CheltuialaPageClient({
  initialCheltuieli,
}: CheltuialaPageClientProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: cheltuieli = initialCheltuieli, isLoading } = useQuery({
    queryKey: ['cheltuieli'],
    queryFn: () => getCheltuieli(),
    initialData: initialCheltuieli,
  });

  const createMutation = useMutation({
    mutationFn: (data: CheltuialaFormData) =>
      createCheltuiala({
        data: data.data,
        categorie: data.categorie,
        suma_lei: Number(data.suma_lei),
        furnizor: data.furnizor || undefined,
        descriere: data.descriere || undefined,
        document_url: undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheltuieli'] });
      toast.success('Cheltuială adăugată');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CheltuialaFormData;
    }) =>
      updateCheltuiala(id, {
        data: payload.data,
        categorie: payload.categorie,
        suma_lei: Number(payload.suma_lei),
        furnizor: payload.furnizor || undefined,
        descriere: payload.descriere || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheltuieli'] });
      toast.success('Cheltuială actualizată');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCheltuiala(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheltuieli'] });
      toast.success('Cheltuială ștearsă');
    },
  });

  const filtered = cheltuieli.filter((c) =>
    (c.categorie ?? '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const total = filtered.reduce((sum, c) => sum + c.suma_lei, 0);

  return (
    <div style={{ padding: 24 }}>
      <h1>Cheltuieli</h1>

      <input
        placeholder="Caută categorie..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: 8, marginBottom: 16, width: 300 }}
      />

      <div style={{ marginBottom: 16 }}>
        <strong>Total cheltuieli:</strong> {filtered.length} |
        <strong> Sumă totală:</strong> {total.toFixed(2)} lei
      </div>

      {isLoading && <p>Se încarcă...</p>}

      {!isLoading && filtered.length === 0 && (
        <p>Nu există cheltuieli.</p>
      )}

      {!isLoading &&
        filtered.map((c) => (
          <div
            key={c.id}
            style={{
              border: '1px solid #ddd',
              padding: 12,
              marginBottom: 8,
              borderRadius: 6,
            }}
          >
            <div>
              <strong>{c.categorie ?? 'Fără categorie'}</strong>
            </div>

            <div>{c.suma_lei} lei</div>
            <div>{c.data}</div>

            <button
              onClick={() =>
                updateMutation.mutate({
                  id: c.id,
                  payload: {
                    data: c.data,
                    categorie: c.categorie ?? '',
                    suma_lei: c.suma_lei,
                  },
                })
              }
            >
              Update test
            </button>

            <button
              onClick={() => deleteMutation.mutate(c.id)}
              style={{ marginLeft: 8 }}
            >
              Delete
            </button>
          </div>
        ))}

      <button
        onClick={() =>
          createMutation.mutate({
            data: new Date().toISOString().slice(0, 10),
            categorie: 'Test',
            suma_lei: 100,
          })
        }
        style={{ marginTop: 16 }}
      >
        Add Test Cheltuială
      </button>
    </div>
  );
}
