'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, Package, Pencil, Trash2, Plus } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Recoltare,
  getRecoltari,
  deleteRecoltare,
} from '@/lib/supabase/queries/recoltari'

import { RecoltareCard } from '@/components/recoltari/RecoltareCard'
import { AddRecoltareDialog } from '@/components/recoltari/AddRecoltareDialog'
import { EditRecoltareDialog } from '@/components/recoltari/EditRecoltareDialog'
import { DeleteConfirmDialog } from '@/components/parcele/DeleteConfirmDialog'

interface Parcela {
  id: string
  id_parcela: string
  nume_parcela: string
}

interface RecoltariPageClientProps {
  initialRecoltari: Recoltare[]
  parcele: Parcela[]
}

export function RecoltariPageClient({
  initialRecoltari,
  parcele,
}: RecoltariPageClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [editingRecoltare, setEditingRecoltare] =
    useState<Recoltare | null>(null)
  const [deletingRecoltare, setDeletingRecoltare] =
    useState<Recoltare | null>(null)

  const { data: recoltari = initialRecoltari } = useQuery({
    queryKey: ['recoltari'],
    queryFn: getRecoltari,
    initialData: initialRecoltari,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRecoltare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoltari'] })
      toast.success('Recoltare ștearsă cu succes!')
      setDeletingRecoltare(null)
    },
    onError: (error) => {
      console.error(error)
      toast.error('Eroare la ștergerea recoltării')
    },
  })

  const parcelaMap = useMemo(() => {
    const map: Record<string, string> = {}
    parcele.forEach((p) => {
      map[p.id] = `${p.id_parcela} - ${p.nume_parcela}`
    })
    return map
  }, [parcele])

  const filteredRecoltari = useMemo(() => {
    if (!searchTerm) return recoltari

    const term = searchTerm.toLowerCase()

    return recoltari.filter(
      (r) =>
        r.id_recoltare.toLowerCase().includes(term) ||
        (r.parcela_id &&
          parcelaMap[r.parcela_id]?.toLowerCase().includes(term))
    )
  }, [recoltari, searchTerm, parcelaMap])

  const totalCantitateKg = useMemo(() => {
    return filteredRecoltari.reduce(
      (sum, r) => sum + r.cantitate_kg,
      0
    )
  }, [filteredRecoltari])

  const handleDelete = (recoltare: Recoltare) => {
    setDeletingRecoltare(recoltare)
  }

  const confirmDelete = () => {
    if (deletingRecoltare) {
      deleteMutation.mutate(deletingRecoltare.id)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden lg:block space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Recoltări
            </h1>
            <p className="text-gray-600 mt-1">
              Evidența producției recoltate
            </p>
          </div>
          <AddRecoltareDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total Cantitate (kg)
                </p>
                <p className="text-3xl font-bold mt-1">
                  {totalCantitateKg.toFixed(2)} kg
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <Label htmlFor="search">Căutare</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Caută după ID sau parcelă..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {filteredRecoltari.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Nicio recoltare găsită
              </h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecoltari.map((recoltare) => (
              <RecoltareCard
                key={recoltare.id}
                recoltare={recoltare}
                parcelaNume={
                  recoltare.parcela_id
                    ? parcelaMap[recoltare.parcela_id]
                    : undefined
                }
                onDelete={handleDelete}
                onEdit={setEditingRecoltare}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden space-y-4 pb-24">
        <button
          onClick={() => router.push('/recoltari/new')}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-[#E5484D] to-[#F87171] text-white font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Adaugă Recoltare
        </button>

        <div className="rounded-2xl shadow-md p-4 bg-white">
          <div className="text-xs text-slate-600 mb-1">Total Cantitate</div>
          <div className="text-lg font-bold text-purple-600">
            {totalCantitateKg.toFixed(2)} kg
          </div>
        </div>

        <input
          type="text"
          placeholder="Caută după ID sau parcelă..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 text-base rounded-xl border border-slate-300 px-4"
        />

        {filteredRecoltari.length === 0 ? (
          <div className="rounded-2xl shadow-md p-12 bg-white text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Nicio recoltare găsită
            </h3>
          </div>
        ) : (
          filteredRecoltari.map((recoltare) => {
            const parcelaNume = recoltare.parcela_id
              ? parcelaMap[recoltare.parcela_id]
              : 'N/A'

            return (
              <div
                key={recoltare.id}
                className="rounded-2xl shadow-md p-4 bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xl font-black text-slate-900">
                      {recoltare.cantitate_kg.toFixed(2)} kg
                    </div>
                    <div className="text-sm text-slate-600">
                      {formatDate(recoltare.data)}
                    </div>
                  </div>
                </div>

                <div className="font-semibold text-slate-900 mb-2">
                  {parcelaNume}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingRecoltare(recoltare)}
                    className="flex-1 h-10 px-4 bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Editează
                  </button>
                  <button
                    onClick={() => handleDelete(recoltare)}
                    className="flex-1 h-10 px-4 bg-red-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Șterge
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <EditRecoltareDialog
        recoltare={editingRecoltare}
        open={!!editingRecoltare}
        onOpenChange={(open) => !open && setEditingRecoltare(null)}
      />

      <DeleteConfirmDialog
        open={!!deletingRecoltare}
        onOpenChange={(open) => !open && setDeletingRecoltare(null)}
        onConfirm={confirmDelete}
        itemName={deletingRecoltare?.id_recoltare || ''}
        itemType="recoltare"
      />
    </>
  )
}