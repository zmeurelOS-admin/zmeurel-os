'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Archive } from 'lucide-react'

import { AppShell } from '@/components/app/AppShell'
import { EmptyState } from '@/components/app/EmptyState'
import { ErrorState } from '@/components/app/ErrorState'
import { LoadingState } from '@/components/app/LoadingState'
import { PageHeader } from '@/components/app/PageHeader'
import { StickyActionBar } from '@/components/app/StickyActionBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getStocuriPeLocatii, type StocFilters } from '@/lib/supabase/queries/miscari-stoc'

interface ParcelaOption {
  id: string
  nume_parcela: string
}

interface StocuriPageClientProps {
  initialParcele: ParcelaOption[]
}

export function StocuriPageClient({ initialParcele }: StocuriPageClientProps) {
  const [locatieId, setLocatieId] = useState<string>('all')
  const [produs, setProdus] = useState<string>('zmeura')
  const [depozit, setDepozit] = useState<'all' | 'fresh' | 'congelat' | 'procesat'>('all')
  const [calitate, setCalitate] = useState<'all' | 'cal1' | 'cal2'>('all')

  const queryFilters = useMemo<StocFilters>(
    () => ({
      locatieId: locatieId === 'all' ? undefined : locatieId,
      produs: produs === 'all' ? undefined : produs,
      depozit,
      calitate,
    }),
    [locatieId, produs, depozit, calitate]
  )

  const {
    data: stocuri = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['stocuri-locatii', queryFilters],
    queryFn: () => getStocuriPeLocatii(queryFilters),
  })

  const totalKg = useMemo(
    () => stocuri.reduce((sum, item) => sum + Number(item.total_kg ?? 0), 0),
    [stocuri]
  )

  return (
    <AppShell
      header={<PageHeader title="Stocuri" subtitle="Inventar real pe locatie (parcela/solar)" rightSlot={<Archive className="h-5 w-5" />} />}
      bottomBar={
        <StickyActionBar>
          <p className="text-sm font-medium text-[var(--agri-text-muted)]">Total stoc: {totalKg.toFixed(2)} kg</p>
        </StickyActionBar>
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-4 py-4">
        <Card className="rounded-2xl border border-[var(--agri-border)] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Filtre stoc</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Locatie</Label>
              <Select value={locatieId} onValueChange={setLocatieId}>
                <SelectTrigger className="agri-control h-11">
                  <SelectValue placeholder="Toate locatiile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate locatiile</SelectItem>
                  {initialParcele.map((parcela) => (
                    <SelectItem key={parcela.id} value={parcela.id}>
                      {parcela.nume_parcela || 'Parcela'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Produs</Label>
              <Select value={produs} onValueChange={setProdus}>
                <SelectTrigger className="agri-control h-11">
                  <SelectValue placeholder="Produs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zmeura">Zmeura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Depozit</Label>
              <Select value={depozit} onValueChange={(value) => setDepozit(value as typeof depozit)}>
                <SelectTrigger className="agri-control h-11">
                  <SelectValue placeholder="Toate depozitele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate depozitele</SelectItem>
                  <SelectItem value="fresh">Fresh</SelectItem>
                  <SelectItem value="congelat">Congelat</SelectItem>
                  <SelectItem value="procesat">Procesat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Calitate</Label>
              <Select value={calitate} onValueChange={(value) => setCalitate(value as typeof calitate)}>
                <SelectTrigger className="agri-control h-11">
                  <SelectValue placeholder="Toate calitatile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate calitatile</SelectItem>
                  <SelectItem value="cal1">Calitatea 1</SelectItem>
                  <SelectItem value="cal2">Calitatea 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isError ? <ErrorState title="Eroare la incarcare stocuri" message={(error as Error).message} onRetry={() => refetch()} /> : null}
        {isLoading ? <LoadingState label="Se calculeaza stocurile..." /> : null}
        {!isLoading && !isError && stocuri.length === 0 ? <EmptyState title="Nu exista miscari de stoc" /> : null}

        {!isLoading && !isError && stocuri.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {stocuri.map((row) => (
              <Card key={`${row.locatie_id}-${row.produs}`} className="rounded-2xl border border-[var(--agri-border)] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">{row.locatie_nume}</CardTitle>
                  <p className="text-xs text-[var(--agri-text-muted)]">Produs: {row.produs}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Stoc Fresh Cal1</span>
                    <span className="font-semibold">{row.stoc_fresh_cal1.toFixed(2)} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stoc Fresh Cal2</span>
                    <span className="font-semibold">{row.stoc_fresh_cal2.toFixed(2)} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stoc Congelat</span>
                    <span className="font-semibold">{row.stoc_congelat.toFixed(2)} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stoc Procesat</span>
                    <span className="font-semibold">{row.stoc_procesat.toFixed(2)} kg</span>
                  </div>
                  <div className="mt-2 border-t border-[var(--agri-border)] pt-2 text-base font-semibold">
                    Total: {row.total_kg.toFixed(2)} kg
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
