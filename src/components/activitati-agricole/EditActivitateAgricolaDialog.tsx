'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  type ActivitateAgricola,
  updateActivitateAgricola,
} from '@/lib/supabase/queries/activitati-agricole'

const supabase = createClient()

export function EditActivitateAgricolaDialog({
  activitate,
  open,
  onOpenChange,
}: {
  activitate: ActivitateAgricola | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const [parcele, setParcele] = useState<any[]>([])

  const [dataAplicare, setDataAplicare] = useState('')
  const [parcelaId, setParcelaId] = useState('')
  const [tipActivitate, setTipActivitate] = useState('')
  const [produs, setProdus] = useState('')
  const [doza, setDoza] = useState('')
  const [timpPauza, setTimpPauza] = useState(0)
  const [observatii, setObservatii] = useState('')

  useEffect(() => {
    if (!open || !activitate) return

    setDataAplicare(
      activitate.data_aplicare
        ? new Date(activitate.data_aplicare).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    )
    setParcelaId(activitate.parcela_id ?? '')
    setTipActivitate(activitate.tip_activitate ?? '')
    setProdus(activitate.produs_utilizat ?? '')
    setDoza(activitate.doza ?? '')
    setTimpPauza(
      typeof activitate.timp_pauza_zile === 'number'
        ? activitate.timp_pauza_zile
        : 0
    )
    setObservatii(activitate.observatii ?? '')

    loadParcele()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activitate?.id])

  async function loadParcele() {
    const { data } = await supabase.from('parcele').select('id, id_parcela')
    if (data) setParcele(data)
  }

  const mutation = useMutation({
    mutationFn: (payload: {
      id: string
      input: {
        data_aplicare?: string
        parcela_id?: string
        tip_activitate?: string
        produs_utilizat?: string
        doza?: string
        timp_pauza_zile?: number
        observatii?: string
      }
    }) => updateActivitateAgricola(payload.id, payload.input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activitati'] })
      toast.success('Activitate actualizată')
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Eroare la actualizare')
    },
  })

  if (!open || !activitate) return null

  const fieldStyle: CSSProperties = {
    width: '100%',
    height: 44,
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    padding: '0 12px',
    outline: 'none',
    background: 'white',
    fontSize: 14,
  }

  const selectStyle: CSSProperties = {
    ...fieldStyle,
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    paddingRight: 36,
  }

  const textAreaStyle: CSSProperties = {
    width: '100%',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    padding: '10px 12px',
    outline: 'none',
    background: 'white',
    fontSize: 14,
    minHeight: 84,
    resize: 'vertical',
  }

  return (
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
          <div>
            <h3 style={{ fontWeight: 900 }}>Editează operațiune</h3>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {activitate.id_activitate}
            </div>
          </div>

          <X onClick={() => onOpenChange(false)} style={{ cursor: 'pointer' }} />
        </div>

        <input
          type="date"
          value={dataAplicare}
          onChange={(e) => setDataAplicare(e.target.value)}
          style={fieldStyle}
        />

        <select
          value={parcelaId}
          onChange={(e) => setParcelaId(e.target.value)}
          style={selectStyle}
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
          style={selectStyle}
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
          style={fieldStyle}
        />

        <input
          placeholder="Cantitate / doză"
          value={doza}
          onChange={(e) => setDoza(e.target.value)}
          style={fieldStyle}
        />

        <input
          type="number"
          placeholder="Timp pauză (zile)"
          value={timpPauza}
          onChange={(e) => setTimpPauza(Number(e.target.value))}
          style={fieldStyle}
        />

        <textarea
          placeholder="Observații"
          value={observatii}
          onChange={(e) => setObservatii(e.target.value)}
          style={textAreaStyle}
        />

        <button
          onClick={() =>
            mutation.mutate({
              id: activitate.id,
              input: {
                data_aplicare: dataAplicare,
                parcela_id: parcelaId || undefined,
                tip_activitate: tipActivitate || undefined,
                produs_utilizat: produs || undefined,
                doza: doza || undefined,
                timp_pauza_zile: timpPauza,
                observatii: observatii || undefined,
              },
            })
          }
          disabled={mutation.isPending}
          style={{
            padding: '16px',
            background: '#0ea5e9',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            fontWeight: 900,
            opacity: mutation.isPending ? 0.7 : 1,
          }}
        >
          {mutation.isPending ? 'Se salvează...' : 'Salvează modificările'}
        </button>
      </div>
    </div>
  )
}