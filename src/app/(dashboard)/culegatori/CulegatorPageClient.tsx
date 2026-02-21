'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  Culegator,
  getCulegatori,
} from '@/lib/supabase/queries/culegatori'

interface Props {
  initialCulegatori: Culegator[]
}

export function CulegatorPageClient({ initialCulegatori }: Props) {
  const queryClient = useQueryClient()

  const { data: culegatori = initialCulegatori } = useQuery({
    queryKey: ['culegatori'],
    queryFn: getCulegatori,
    initialData: initialCulegatori,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Culegători</h1>

      {culegatori.map((c) => (
        <div
          key={c.id}
          className="border p-4 rounded flex justify-between"
        >
          <span>{c.nume_prenume}</span>
          <span>{c.tarif_lei_kg} lei/kg</span>
        </div>
      ))}
    </div>
  )
}
