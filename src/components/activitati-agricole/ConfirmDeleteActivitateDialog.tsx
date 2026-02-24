'use client'

import { Trash2, X } from 'lucide-react'

export function ConfirmDeleteActivitateDialog({
  open,
  title = 'Ștergere activitate',
  message,
  confirmText = 'Șterge definitiv',
  cancelText = 'Renunță',
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: 'white',
          width: '100%',
          maxWidth: 420,
          borderRadius: 24,
          padding: 20,
          boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
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
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={18} />
            </div>

            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                Acțiune definitivă
              </div>
            </div>
          </div>

          <button
            onClick={onCancel}
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 14, color: '#334155' }}>
          {message}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              background: 'white',
              fontWeight: 900,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 16,
              border: 'none',
              background: '#ef4444',
              color: 'white',
              fontWeight: 900,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Se șterge...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}