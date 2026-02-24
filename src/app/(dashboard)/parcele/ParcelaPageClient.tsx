'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Map, Search } from 'lucide-react'

import {
  getParcele,
  createParcela,
  updateParcela,
  deleteParcela,
  type Parcela,
} from '@/lib/supabase/queries/parcele'

import { AddParcelaDialog } from '@/components/parcele/AddParcelaDialog'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ParcelaFormData {
  nume_parcela: string
  suprafata_m2: number | string
  soi_plantat?: string
  an_plantare: number | string
  nr_plante?: number | string
  status: string
  gps_lat?: number | string
  gps_lng?: number | string
  observatii?: string
}

interface ParcelaPageClientProps {
  initialParcele: Parcela[]
}

export function ParcelaPageClient({
  initialParcele,
}: ParcelaPageClientProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data: parcele = initialParcele, isLoading } = useQuery({
    queryKey: ['parcele'],
    queryFn: () => getParcele(),
    initialData: initialParcele,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteParcela(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcele'] })
      toast.success('Parcelă ștearsă')
    },
  })

  const filtered = parcele.filter((p) =>
    p.nume_parcela.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-b-[40px] px-6 pt-14 pb-20 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Parcele</h1>
            <p className="text-sm text-emerald-100 mt-1">
              Administrează terenurile cultivate.
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-xl">
            <Map className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      <div className="px-5 -mt-10 space-y-8">
        {/* Search */}
        <Card className="p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută parcelă..."
              className="border-none shadow-none focus-visible:ring-0"
            />
          </div>
        </Card>

        {/* Loading */}
        {isLoading && (
          <p className="text-center text-muted-foreground">Se încarcă...</p>
        )}

        {/* List */}
        {!isLoading &&
          filtered.map((p) => (
            <Card
              key={p.id}
              className="p-5 rounded-2xl shadow-sm space-y-2"
            >
              <div className="text-lg font-bold">{p.nume_parcela}</div>

              <div className="text-sm text-muted-foreground">
                {p.suprafata_m2} m²
              </div>

              <div className="text-sm text-muted-foreground">
                Status: {p.status}
              </div>

              {p.soi_plantat && (
                <div className="text-sm text-muted-foreground">
                  Soi: {p.soi_plantat}
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(p.id)}
                  disabled={deleteMutation.isPending}
                >
                  Șterge
                </Button>
              </div>
            </Card>
          ))}
      </div>

      {/* Floating Action */}
      <div className="fixed left-5 right-5 bottom-28 z-50">
        <AddParcelaDialog
          soiuriDisponibile={[
            'Delniwa',
            'Maravilla',
            'Enrosadira',
            'Husaria',
          ]}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ['parcele'] })
          }
        />
      </div>
    </div>
  )
}