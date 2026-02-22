'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getCheltuieli,
  createCheltuiala,
  updateCheltuiala,
  deleteCheltuiala,
  type Cheltuiala,
} from '@/lib/supabase/queries/cheltuieli';

import { AddCheltuialaDialog } from '@/components/cheltuieli/AddCheltuialaDialog';
import { EditCheltuialaDialog } from '@/components/cheltuieli/EditCheltuialaDialog';
import { CheltuialaCard } from '@/components/cheltuieli/CheltuialaCard';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export function CheltuialaPageClient({ initialCheltuieli }: CheltuialaPageClientProps) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Cheltuiala | null>(null);

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
    onError: (err) => {
      console.error(err);
      toast.error('Eroare la adăugare cheltuială');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CheltuialaFormData }) =>
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
    onError: (err) => {
      console.error(err);
      toast.error('Eroare la actualizare cheltuială');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCheltuiala(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheltuieli'] });
      toast.success('Cheltuială ștearsă');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Eroare la ștergere cheltuială');
    },
  });

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return cheltuieli.filter((c) => (c.categorie ?? '').toLowerCase().includes(s));
  }, [cheltuieli, search]);

  const total = useMemo(
    () => filtered.reduce((sum, c) => sum + Number(c.suma_lei || 0), 0),
    [filtered]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Cheltuieli</h1>
          <p className="text-sm text-muted-foreground">
            Gestionare cheltuieli (RLS + multi-tenant).
          </p>
        </div>

        <Button
          onClick={() => setAddOpen(true)}
          disabled={createMutation.isPending}
          style={{ backgroundColor: '#F16B6B', color: 'white' }}
        >
          Adaugă cheltuială
        </Button>
      </div>

      {/* Filters + totals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Căutare</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Caută categorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sumar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Total cheltuieli:</span>{' '}
              <span className="font-semibold">{filtered.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Sumă totală:</span>{' '}
              <span className="font-semibold">{total.toFixed(2)} lei</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

      {!isLoading && filtered.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nu există cheltuieli.
          </CardContent>
        </Card>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CheltuialaCard
              key={c.id}
              cheltuiala={c}
              onEdit={(ch) => {
                setEditing(ch);
                setEditOpen(true);
              }}
              onDelete={(id, _name) => {
                // păstrăm confirmarea simplă, fără UI nou
                const ok = window.confirm('Sigur vrei să ștergi această cheltuială?');
                if (ok) deleteMutation.mutate(id);
              }}
            />
          ))}
        </div>
      )}

      {/* Dialog Adăugare */}
      <AddCheltuialaDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={async (data) => {
          await createMutation.mutateAsync({
            data: data.data,
            categorie: data.categorie,
            suma_lei: data.suma_lei,
            furnizor: data.furnizor || undefined,
            descriere: data.descriere || undefined,
          });
        }}
      />

      {/* Dialog Editare */}
      <EditCheltuialaDialog
        cheltuiala={editing}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={async (id, data) => {
          await updateMutation.mutateAsync({
            id,
            payload: {
              data: data.data,
              categorie: data.categorie,
              suma_lei: data.suma_lei,
              furnizor: data.furnizor || undefined,
              descriere: data.descriere || undefined,
            },
          });
        }}
      />
    </div>
  );
}