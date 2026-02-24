'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'

import { AddActivitateAgricolaDialog } from '@/components/activitati-agricole/AddActivitateAgricolaDialog'
import { EditActivitateAgricolaDialog } from '@/components/activitati-agricole/EditActivitateAgricolaDialog'
import { ConfirmDeleteActivitateDialog } from '@/components/activitati-agricole/ConfirmDeleteActivitateDialog'

import {
  getActivitatiAgricole,
  deleteActivitateAgricola,
  type ActivitateAgricola,
} from '@/lib/supabase/queries/activitati-agricole'

export default function ActivitatiPage() {
  const queryClient = useQueryClient()

  const { data: activitati = [], isLoading, isError, error } = useQuery({
    queryKey: ['activitati'],
    queryFn: getActivitatiAgricole,
  })

  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<ActivitateAgricola | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toDelete, setToDelete] = useState<ActivitateAgricola | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteActivitateAgricola(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activitati'] })
      toast.success('Activitate ștearsă')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Eroare la ștergere')
    },
  })

  function onDelete(a: ActivitateAgricola) {
    setToDelete(a)
    setDeleteOpen(true)
  }

  return (
    <div
      style={{
        backgroundColor: '#F8F9FB',
        minHeight: '100vh',
        padding: '20px',
        paddingBottom: '160px',
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>
        Activități Agricole
      </h1>

      <AddActivitateAgricolaDialog />

      {/* Dialog Edit (single, controlled) */}
      <EditActivitateAgricolaDialog
        activitate={selected}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setSelected(null)
        }}
      />

      {/* Confirm Delete (custom, rounded) */}
      <ConfirmDeleteActivitateDialog
        open={deleteOpen}
        message={
          toDelete
            ? `Sigur vrei să ștergi activitatea ${toDelete.id_activitate || ''}?`
            : 'Sigur vrei să ștergi această activitate?'
        }
        loading={deleteMutation.isPending}
        onCancel={() => {
          setDeleteOpen(false)
          setToDelete(null)
        }}
        onConfirm={() => {
          if (!toDelete) return
          deleteMutation.mutate(toDelete.id, {
            onSuccess: () => {
              setDeleteOpen(false)
              setToDelete(null)
            },
          })
        }}
      />

      <div style={{ marginTop: 30 }}>
        {isLoading && <p>Se încarcă...</p>}

        {isError && (
          <p style={{ color: '#ef4444' }}>
            Eroare: {(error as any)?.message || 'Nu pot încărca activitățile.'}
          </p>
        )}

        {!isLoading && !isError && activitati.length === 0 && (
          <p>Nu există activități.</p>
        )}

        {(activitati as ActivitateAgricola[]).map((a) => (
          <div
            key={a.id}
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{a.tip_activitate || '—'}</div>

                <div style={{ fontSize: 14, color: '#64748b' }}>
                  {a.produs_utilizat || '—'}
                </div>

                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {a.data_aplicare
                    ? new Date(a.data_aplicare).toLocaleDateString()
                    : '—'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => {
                    setSelected(a)
                    setEditOpen(true)
                  }}
                  title="Editează"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => onDelete(a)}
                  title="Șterge"
                  disabled={deleteMutation.isPending}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    border: '1px solid #fee2e2',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: deleteMutation.isPending ? 0.7 : 1,
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}