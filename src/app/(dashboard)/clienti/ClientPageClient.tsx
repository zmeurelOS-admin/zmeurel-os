'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, ShoppingCart, UserCheck } from 'lucide-react'
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
import { ClientCard } from '@/components/clienti/ClientCard'
import { EditClientDialog } from '@/components/clienti/EditClientDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AddVanzareDialog } from '@/components/vanzari/AddVanzareDialog'
import {
  createClienti,
  deleteClienti,
  getClienti,
  updateClienti,
  type Client,
} from '@/lib/supabase/queries/clienti'

interface ClientPageClientProps {
  initialClienti: Client[]
}

export function ClientPageClient({ initialClienti }: ClientPageClientProps) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addOrderOpen, setAddOrderOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
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
      toast.success('Client adăugat cu succes')
      setDialogOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateClienti>[1] }) =>
      updateClienti(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clienti'] })
      toast.success('Client actualizat')
      setEditOpen(false)
      setEditingClient(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteClienti,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clienti'] })
      toast.success('Client șters')
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

    toast.warning('Client programat pentru ștergere.', {
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
          toast.success('Ștergerea a fost anulată.')
        },
      },
    })
  }

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['clienti'] })
  }

  const filteredClienti = useMemo(() => {
    if (!searchTerm.trim()) return clienti

    const term = searchTerm.toLowerCase().trim()
    return clienti.filter((client) =>
      [client.nume_client, client.telefon, client.email, client.adresa, client.observatii]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term))
    )
  }, [clienti, searchTerm])

  return (
    <AppShell
      header={<PageHeader title="Clienți" subtitle="Administrare clienți și prețuri negociate" rightSlot={<UserCheck className="h-5 w-5" />} />}
      fab={<Fab onClick={() => setDialogOpen(true)} label="Adaugă client" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Total clienti: {clienti.length}</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        <div className="flex items-center gap-2">
          <Input
            className="agri-control h-12"
            placeholder="Caută client după nume, telefon sau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="button" variant="outline" className="h-12 w-12 shrink-0 p-0" aria-label="Caută clienți">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Button
          type="button"
          className="agri-cta w-full bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
          onClick={() => setAddOrderOpen(true)}
        >
          <ShoppingCart className="h-4 w-4" />
          Comandă nouă
        </Button>

        {isError ? <ErrorState title="Eroare la încărcare" message={(error as Error).message} onRetry={refresh} /> : null}
        {isLoading ? <LoadingState label="Se încarcă clienții..." /> : null}

        {!isLoading && !isError && filteredClienti.length === 0 ? (
          <EmptyState
            title="Niciun client"
            description="Adaugă primul client folosind acțiunea principală."
            primaryAction={{ label: 'Adaugă client', onClick: () => setDialogOpen(true) }}
          />
        ) : null}

        {!isLoading && !isError && filteredClienti.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredClienti.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={(item) => {
                  setEditingClient(item)
                  setEditOpen(true)
                }}
                onDelete={(id) => {
                  const target = clienti.find((item) => item.id === id) ?? null
                  setDeletingClient(target)
                }}
              />
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
            telefon: data.telefon || null,
            email: data.email || null,
            adresa: data.adresa || null,
            pret_negociat_lei_kg: data.pret_negociat_lei_kg ? Number(data.pret_negociat_lei_kg) : null,
            observatii: data.observatii || null,
          })
        }}
      />

      <AddVanzareDialog open={addOrderOpen} onOpenChange={setAddOrderOpen} hideTrigger />

      <EditClientDialog
        client={editingClient}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditingClient(null)
        }}
        onSubmit={async (id, data) => {
          await updateMutation.mutateAsync({
            id,
            payload: {
              nume_client: data.nume_client,
              telefon: data.telefon || null,
              email: data.email || null,
              adresa: data.adresa || null,
              pret_negociat_lei_kg: data.pret_negociat_lei_kg ? Number(data.pret_negociat_lei_kg) : null,
              observatii: data.observatii || null,
            },
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
        description="Clientul selectat va fi sters definitiv."
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
