'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserCheck } from 'lucide-react'
import { toast } from 'sonner'

import { AppShell } from '@/components/app/AppShell'
import { ConfirmDeleteDialog } from '@/components/app/ConfirmDeleteDialog'
import { EmptyState } from '@/components/app/EmptyState'
import { ErrorState } from '@/components/app/ErrorState'
import { Fab } from '@/components/app/Fab'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { StickyActionBar } from '@/components/app/StickyActionBar'
import { AddClientDialog } from '@/components/clienti/AddClientDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  createClienti,
  deleteClienti,
  getClienti,
  type Client,
} from '@/lib/supabase/queries/clienti'

interface ClientPageClientProps {
  initialClienti: Client[]
}

export function ClientPageClient({ initialClienti }: ClientPageClientProps) {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const pendingDeleteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pendingDeletedItems = useRef<Record<string, Client>>({})

  const {
    data: clienti = initialClienti,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['clienti'],
    queryFn: getClienti,
    initialData: initialClienti,
  })

  const createMutation = useMutation({
    mutationFn: createClienti,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clienti'] })
      toast.success('Client adaugat cu succes')
      setDialogOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteClienti,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clienti'] })
      toast.success('Client sters')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      queryClient.invalidateQueries({ queryKey: ['clienti'] })
    },
  })

  useEffect(() => {
    return () => {
      Object.values(pendingDeleteTimers.current).forEach((timer) => clearTimeout(timer))
    }
  }, [])

  const scheduleDelete = (client: Client) => {
    const clientId = client.id

    pendingDeletedItems.current[clientId] = client
    queryClient.setQueryData<Client[]>(['clienti'], (current = []) =>
      current.filter((item) => item.id !== clientId)
    )

    const timer = setTimeout(() => {
      delete pendingDeleteTimers.current[clientId]
      delete pendingDeletedItems.current[clientId]
      deleteMutation.mutate(clientId)
    }, 5000)

    pendingDeleteTimers.current[clientId] = timer

    toast.warning('Client programat pentru stergere.', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          const pendingTimer = pendingDeleteTimers.current[clientId]
          if (!pendingTimer) return
          clearTimeout(pendingTimer)
          delete pendingDeleteTimers.current[clientId]
          delete pendingDeletedItems.current[clientId]
          queryClient.invalidateQueries({ queryKey: ['clienti'] })
          toast.success('Stergerea a fost anulata.')
        },
      },
    })
  }

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['clienti'] })
  }

  return (
    <AppShell
      header={<PageHeader title="Clienti" subtitle="Administrare clienti si preturi negociate" rightSlot={<UserCheck className="h-5 w-5" />} />}
      fab={<Fab onClick={() => setDialogOpen(true)} label="Adauga client" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Total clienti: {clienti.length}</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        {isError ? <ErrorState title="Eroare la incarcare" message={(error as Error).message} onRetry={refresh} /> : null}
        {isLoading ? <LoadingState label="Se incarca clientii..." /> : null}

        {!isLoading && !isError && clienti.length === 0 ? (
          <EmptyState
            title="Niciun client"
            description="Adauga primul client folosind actiunea principala."
            primaryAction={{ label: 'Adauga client', onClick: () => setDialogOpen(true) }}
          />
        ) : null}

        {!isLoading && !isError && clienti.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {clienti.map((client) => (
              <Card key={client.id} className="agri-card">
                <CardContent className="space-y-2 p-4">
                  <h3 className="text-lg font-semibold text-[var(--agri-text)]">{client.nume_client}</h3>
                  {client.telefon ? <p className="text-sm text-[var(--agri-text-muted)]">{client.telefon}</p> : null}
                  {client.email ? <p className="text-sm text-[var(--agri-text-muted)]">{client.email}</p> : null}
                  {client.pret_negociat_lei_kg ? (
                    <p className="text-sm text-[var(--agri-text-muted)]">Pret negociat: {client.pret_negociat_lei_kg} lei/kg</p>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    className="agri-control h-11 w-full border-red-200 text-red-700"
                    onClick={() => setDeletingClient(client)}
                  >
                    Sterge
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>

      <AddClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={async (data) => {
          await createMutation.mutateAsync({
            nume_client: data.nume_client,
            telefon: data.telefon,
            email: data.email,
            adresa: data.adresa,
          })
        }}
      />

      <ConfirmDeleteDialog
        open={!!deletingClient}
        onOpenChange={(open) => {
          if (!open) setDeletingClient(null)
        }}
        itemType="Client"
        itemName={deletingClient?.nume_client}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deletingClient) return
          scheduleDelete(deletingClient)
          setDeletingClient(null)
        }}
      />
    </AppShell>
  )
}
