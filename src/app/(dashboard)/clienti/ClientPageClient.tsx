'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserCheck, Plus } from 'lucide-react';
import {
  getClienti,
  createClienti,
  deleteClienti,
  type Client,
} from '@/lib/supabase/queries/clienti';
import { AddClientDialog } from '@/components/clienti/AddClientDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ClientPageClientProps {
  initialClienti: Client[];
}

export function ClientPageClient({ initialClienti }: ClientPageClientProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: clienti = initialClienti } = useQuery({
    queryKey: ['clienti'],
    queryFn: getClienti,
    initialData: initialClienti,
  });

  const createMutation = useMutation({
    mutationFn: createClienti,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clienti'] });
      toast.success('Client adăugat cu succes!');
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Eroare: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClienti,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clienti'] });
      toast.success('Client șters!');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clienți</h1>
            <p className="text-gray-600 mt-1">{clienti.length} clienți</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#F16B6B] hover:bg-[#ef4444]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adaugă Client
          </Button>
        </div>

        {clienti.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Niciun client adăugat încă
              </h3>
              <p className="text-gray-600">
                Începe prin a adăuga primul client folosind butonul de mai sus
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clienti.map((client) => (
              <Card key={client.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {client.nume_client}
                      </h3>
                      {client.telefon && (
                        <p className="text-sm text-gray-600">
                          📞 {client.telefon}
                        </p>
                      )}
                      {client.email && (
                        <p className="text-sm text-gray-600">
                          ✉️ {client.email}
                        </p>
                      )}
                      {client.pret_negociat_lei_kg && (
                        <p className="text-sm text-gray-600">
                          💰 {client.pret_negociat_lei_kg} lei/kg
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(client.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Șterge
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AddClientDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={async (data) => {
            await createMutation.mutateAsync({
              nume_client: data.nume_client,
              telefon: data.telefon,
              email: data.email,
              adresa: data.adresa,
            });
          }}
        />
      </div>
    </div>
  );
}
