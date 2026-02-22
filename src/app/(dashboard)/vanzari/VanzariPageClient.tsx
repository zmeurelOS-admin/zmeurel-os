'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, DollarSign, TrendingUp, Calculator } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Vanzare,
  getVanzari,
  deleteVanzare,
} from '@/lib/supabase/queries/vanzari';

import { VanzareCard } from '@/components/vanzari/VanzareCard';
import { AddVanzareDialog } from '@/components/vanzari/AddVanzareDialog';
import { EditVanzareDialog } from '@/components/vanzari/EditVanzareDialog';
import { DeleteConfirmDialog } from '@/components/parcele/DeleteConfirmDialog';

interface Client {
  id: string;
  nume: string;
}

interface VanzariPageClientProps {
  initialVanzari: Vanzare[];
  clienti: Client[];
}

export function VanzariPageClient({
  initialVanzari,
  clienti,
}: VanzariPageClientProps) {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [editingVanzare, setEditingVanzare] = useState<Vanzare | null>(null);
  const [deletingVanzare, setDeletingVanzare] = useState<Vanzare | null>(null);

  const { data: vanzari = initialVanzari } = useQuery({
    queryKey: ['vanzari'],
    queryFn: () => getVanzari(),
    initialData: initialVanzari,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVanzare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vanzari'] });
      toast.success('Vânzare ștearsă cu succes!');
      setDeletingVanzare(null);
    },
    onError: () => {
      toast.error('Eroare la ștergerea vânzării');
    },
  });

  const clientMap = useMemo(() => {
    const map: Record<string, string> = {};
    clienti.forEach((c) => {
      map[c.id] = c.nume;
    });
    return map;
  }, [clienti]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    vanzari.forEach((v) => {
      const date = new Date(v.data);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      months.add(key);
    });
    return Array.from(months).sort().reverse();
  }, [vanzari]);

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
    });
  };

  const filteredVanzari = useMemo(() => {
    let filtered = vanzari;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.id_vanzare.toLowerCase().includes(term) ||
          (v.client_id && clientMap[v.client_id]?.toLowerCase().includes(term)) ||
          v.status_plata.toLowerCase().includes(term) ||
          v.observatii_ladite?.toLowerCase().includes(term)
      );
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter((v) => {
        const date = new Date(v.data);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`;
        return key === selectedMonth;
      });
    }

    return filtered;
  }, [vanzari, searchTerm, selectedMonth, clientMap]);

  const stats = useMemo(() => {
    const total = filteredVanzari.length;
    const sumaTotala = filteredVanzari.reduce(
      (sum, v) => sum + v.cantitate_kg * v.pret_lei_kg,
      0
    );
    const medie = total > 0 ? sumaTotala / total : 0;

    return { total, sumaTotala, medie };
  }, [filteredVanzari]);

  const formatSuma = (suma: number) =>
    new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(suma);

  const confirmDelete = () => {
    if (deletingVanzare) {
      deleteMutation.mutate(deletingVanzare.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vânzări Fructe</h1>
          <p className="text-gray-600 mt-1">
            Gestionează vânzările de fructe proaspete
          </p>
        </div>
        <AddVanzareDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total Vânzări</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Venituri Totale</p>
            <p className="text-3xl font-bold text-green-600">
              +{formatSuma(stats.sumaTotala)} lei
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Medie per Vânzare</p>
            <p className="text-3xl font-bold">
              {formatSuma(stats.medie)} lei
            </p>
          </CardContent>
        </Card>
      </div>

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
          <VanzareCard
            key={vanzare.id}
            vanzare={vanzare}
            clientNume={
              vanzare.client_id ? clientMap[vanzare.client_id] : undefined
            }
            onEdit={setEditingVanzare}
            onDelete={setDeletingVanzare}
          />
        ))}
      </div>

      <EditVanzareDialog
        vanzare={editingVanzare}
        open={!!editingVanzare}
        onOpenChange={(open) => !open && setEditingVanzare(null)}
      />

      <DeleteConfirmDialog
        open={!!deletingVanzare}
        onOpenChange={(open) => !open && setDeletingVanzare(null)}
        onConfirm={confirmDelete}
        itemName={deletingVanzare?.id_vanzare || ''}
        itemType="vânzare"
      />
    </div>
  );
}
