'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChartNoAxesColumn } from 'lucide-react'
import { toast } from 'sonner'

import { AppShell } from '@/components/app/AppShell'
import { EmptyState } from '@/components/app/EmptyState'
import { ErrorState } from '@/components/app/ErrorState'
import { Fab } from '@/components/app/Fab'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { StickyActionBar } from '@/components/app/StickyActionBar'
import { DeleteConfirmDialog } from '@/components/parcele/DeleteConfirmDialog'
import { AddInvestitieDialog } from '@/components/investitii/AddInvestitieDialog'
import { EditInvestitieDialog } from '@/components/investitii/EditInvestitieDialog'
import { InvestitieCard } from '@/components/investitii/InvestitieCard'
import { Input } from '@/components/ui/input'
import {
  deleteInvestitie,
  getInvestitii,
  type Investitie,
} from '@/lib/supabase/queries/investitii'

interface Parcela {
  id: string
  nume_parcela: string
}

interface InvestitiiPageClientProps {
  initialInvestitii: Investitie[]
  parcele: Parcela[]
}

export function InvestitiiPageClient({ initialInvestitii, parcele }: InvestitiiPageClientProps) {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editingInvestitie, setEditingInvestitie] = useState<Investitie | null>(null)
  const [deletingInvestitie, setDeletingInvestitie] = useState<Investitie | null>(null)

  const {
    data: investitii = initialInvestitii,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['investitii'],
    queryFn: getInvestitii,
    initialData: initialInvestitii,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteInvestitie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investitii'] })
      toast.success('Investitie stearsa')
      setDeletingInvestitie(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const parcelaMap = useMemo(() => {
    const map: Record<string, string> = {}
    parcele.forEach((p) => {
      map[p.id] = p.nume_parcela || 'Parcela'
    })
    return map
  }, [parcele])

  const filteredInvestitii = useMemo(() => {
    if (!searchTerm) return investitii
    const term = searchTerm.toLowerCase()

    return investitii.filter(
      (inv) =>
        inv.categorie?.toLowerCase().includes(term) ||
        inv.furnizor?.toLowerCase().includes(term) ||
        inv.descriere?.toLowerCase().includes(term)
    )
  }, [investitii, searchTerm])

  const stats = useMemo(() => {
    const total = filteredInvestitii.length
    const sumaTotala = filteredInvestitii.reduce((sum, inv) => sum + inv.suma_lei, 0)
    return { total, sumaTotala }
  }, [filteredInvestitii])

  return (
    <AppShell
      header={<PageHeader title="Investitii" subtitle="Monitorizare CAPEX" rightSlot={<ChartNoAxesColumn className="h-5 w-5" />} />}
      fab={<Fab onClick={() => setAddOpen(true)} label="Adauga investitie" />}
      bottomBar={
        <StickyActionBar>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--agri-text-muted)]">Total investit: {stats.sumaTotala.toFixed(2)} lei</p>
          </div>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        <Input className="agri-control h-12" placeholder="Cauta investitie..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        {isError ? <ErrorState title="Eroare" message={(error as Error).message} /> : null}
        {isLoading ? <LoadingState label="Se incarca investitiile..." /> : null}
        {!isLoading && !isError && filteredInvestitii.length === 0 ? <EmptyState title="Nu exista investitii" /> : null}

        {!isLoading && !isError && filteredInvestitii.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredInvestitii.map((investitie) => (
              <InvestitieCard
                key={investitie.id}
                investitie={investitie}
                parcelaNume={investitie.parcela_id ? parcelaMap[investitie.parcela_id] : undefined}
                onEdit={setEditingInvestitie}
                onDelete={setDeletingInvestitie}
              />
            ))}
          </div>
        ) : null}
      </div>

      <AddInvestitieDialog open={addOpen} onOpenChange={setAddOpen} hideTrigger />

      <EditInvestitieDialog
        investitie={editingInvestitie}
        open={!!editingInvestitie}
        onOpenChange={(open) => {
          if (!open) setEditingInvestitie(null)
        }}
      />

      <DeleteConfirmDialog
        open={!!deletingInvestitie}
        onOpenChange={(open) => {
          if (!open) setDeletingInvestitie(null)
        }}
        onConfirm={() => {
          if (deletingInvestitie) deleteMutation.mutate(deletingInvestitie.id)
        }}
        itemName={deletingInvestitie?.categorie || 'investitia selectata'}
        itemType="investitie"
      />
    </AppShell>
  )
}
