'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createActivitateAgricola } from '@/lib/supabase/queries/activitati-agricole'

const supabase = createClient()

export function AddActivitateAgricolaDialog() {
  const queryClient = useQueryClient()

  const [isOpen, setIsOpen] = useState(false)
  const [parcele, setParcele] = useState<any[]>([])

  const [dataAplicare, setDataAplicare] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [parcelaId, setParcelaId] = useState('')
  const [tipActivitate, setTipActivitate] = useState('')
  const [produs, setProdus] = useState('')
  const [doza, setDoza] = useState('')
  const [timpPauza, setTimpPauza] = useState(0)
  const [observatii, setObservatii] = useState('')

  useEffect(() => {
    loadParcele()
  }, [])

  async function loadParcele() {
    const { data } = await supabase
      .from('parcele')
      .select('id, id_parcela')

    if (data) setParcele(data)
  }

  const mutation = useMutation({
    mutationFn: createActivitateAgricola,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activitati'] })
      toast.success('Activitate salvată')
      setIsOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Eroare la salvare')
    },
  })

  async function onSubmit() {
    mutation.mutate({
      data_aplicare: dataAplicare,
      parcela_id: parcelaId || undefined,
      tip_activitate: tipActivitate || undefined,
      produs_utilizat: produs || undefined,
      doza: doza || undefined,
      timp_pauza_zile: timpPauza,
      observatii: observatii || undefined,
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          width: '100%',
          padding: '18px',
          background: 'linear-gradient(90deg,#065F46,#059669)',
          border: 'none',
          borderRadius: '22px',
          color: 'white',
          fontWeight: 800,
          fontSize: '15px',
        }}
      >
        + Nouă Operațiune
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              width: '100%',
              maxWidth: '420px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '24px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>Adaugă operațiune</h3>
              <X onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }} />
            </div>

            <input
              type="date"
              value={dataAplicare}
              onChange={(e) => setDataAplicare(e.target.value)}
            />

            <select
              value={parcelaId}
              onChange={(e) => setParcelaId(e.target.value)}
            >
              <option value="">Selectează parcela</option>
              {parcele.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id_parcela}
                </option>
              ))}
            </select>

            <select
              value={tipActivitate}
              onChange={(e) => setTipActivitate(e.target.value)}
            >
              <option value="">Tip operațiune</option>
              <option value="fertilizare_foliara">Fertilizare foliară</option>
              <option value="fertirigare">Fertirigare</option>
              <option value="fertilizare_baza">Fertilizare de bază</option>
              <option value="fungicide_pesticide">Fungicide/Pesticide</option>
              <option value="irigatie">Irigatie</option>
              <option value="altele">Altele</option>
            </select>

            <input
              placeholder="Produs"
              value={produs}
              onChange={(e) => setProdus(e.target.value)}
            />

            <input
              placeholder="Cantitate / doză"
              value={doza}
              onChange={(e) => setDoza(e.target.value)}
            />

            <input
              type="number"
              placeholder="Timp pauză (zile)"
              value={timpPauza}
              onChange={(e) => setTimpPauza(Number(e.target.value))}
            />

            <textarea
              placeholder="Observații"
              value={observatii}
              onChange={(e) => setObservatii(e.target.value)}
            />

            <button
              onClick={onSubmit}
              disabled={mutation.isPending}
              style={{
                padding: '16px',
                background: '#EF4444',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                fontWeight: 800,
                opacity: mutation.isPending ? 0.7 : 1,
              }}
            >
              {mutation.isPending ? 'Se salvează...' : 'Salvează'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}