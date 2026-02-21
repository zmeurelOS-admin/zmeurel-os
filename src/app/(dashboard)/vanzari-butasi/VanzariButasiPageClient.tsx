'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import {
  VanzareButasi,
  getVanzariButasi,
  deleteVanzareButasi,
} from '@/lib/supabase/queries/vanzari-butasi';

import { VanzareButasiCard } from '@/components/vanzari-butasi/VanzareButasiCard';
import { AddVanzareButasiDialog } from '@/components/vanzari-butasi/AddVanzareButasiDialog';
import { EditVanzareButasiDialog } from '@/components/vanzari-butasi/EditVanzareButasiDialog';
import { DeleteConfirmDialog } from '@/components/parcele/DeleteConfirmDialog';

interface Client {
  id: string;
  id_client: string;
  nume_client: string;
}

interface Parcela {
  id: string;
  id_parcela: string;
  nume_parcela: string;
}

interface VanzariButasiPageClientProps {
  initialVanzari: VanzareButasi[];
  clienti: Client[];
  parcele: Parcela[];
}

export function VanzariButasiPageClient({
  initialVanzari,
  clienti,
  parcele,
}: VanzariButasiPageClientProps) {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingVanzare, setEditingVanzare] = useState<VanzareButasi | null>(null);
  const [deletingVanzare, setDeletingVanzare] = useState<VanzareButasi | null>(null);

  const { data: vanzari = initialVanzari } = useQuery({
    queryKey: ['vanzari-butasi'],
    queryFn: getVanzariButasi,
    initialData: initialVanzari,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVanzareButasi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vanzari-butasi'] });
      toast.success('Vânzare ștearsă cu succes!');
      setDeletingVanzare(null);
    },
    onError: () => {
      toast.error('Eroare la ștergere');
    },
  });

  const clientMap = useMemo(() => {
    const map: Record<string, string> = {};
    clienti.forEach((c) => {
      map[c.id] = `${c.id_client} - ${c.nume_client}`;
    });
    return map;
  }, [clienti]);

  const parcelaMap = useMemo(() => {
    const map: Record<string, string> = {};
    parcele.forEach((p) => {
      map[p.id] = `${p.id_parcela} - ${p.nume_parcela}`;
    });
    return map;
  }, [parcele]);

  const filteredVanzari = useMemo(() => {
    if (!searchTerm) return vanzari;

    const term = searchTerm.toLowerCase();

    return vanzari.filter(
      (vb) =>
        vb.id_vanzare_butasi.toLowerCase().includes(term) ||
        vb.soi_butasi?.toLowerCase().includes(term) ||
        (vb.client_id && clientMap[vb.client_id]?.toLowerCase().includes(term)) ||
        vb.observatii?.toLowerCase().includes(term)
    );
  }, [vanzari, searchTerm, clientMap]);

  const totalVenit = useMemo(() => {
    return filteredVanzari.reduce(
      (sum, vb) => sum + vb.cantitate_butasi * vb.pret_unitar_lei,
      0
    );
  }, [filteredVanzari]);

  const confirmDelete = () => {
    if (deletingVanzare) {
      deleteMutation.mutate(deletingVanzare.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vânzări Butași</h1>
          <p className="text-gray-600 mt-1">
            Gestionează vânzările de material săditor
          </p>
        </div>
        <AddVanzareButasiDialog />
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600">Venit total</p>
          <p className="text-3xl font-bold text-green-600">
            {totalVenit.toFixed(2)} lei
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Caută..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVanzari.map((vanzare) => (
          <VanzareButasiCard
            key={vanzare.id}
            vanzare={vanzare}
            clientNume={
              vanzare.client_id ? clientMap[vanzare.client_id] : undefined
            }
            parcelaNume={
              vanzare.parcela_sursa_id
                ? parcelaMap[vanzare.parcela_sursa_id]
                : undefined
            }
            onEdit={setEditingVanzare}
            onDelete={setDeletingVanzare}
          />
        ))}
      </div>

      <EditVanzareButasiDialog
        vanzare={editingVanzare}
        open={!!editingVanzare}
        onOpenChange={(open) => !open && setEditingVanzare(null)}
      />

      <DeleteConfirmDialog
        open={!!deletingVanzare}
        onOpenChange={(open) => !open && setDeletingVanzare(null)}
        onConfirm={confirmDelete}
        itemName={deletingVanzare?.id_vanzare_butasi || ''}
        itemType="vânzare"
      />
    </div>
  );
}
