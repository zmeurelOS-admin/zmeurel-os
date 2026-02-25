'use client'

import { Plus } from 'lucide-react'

interface FabProps {
  onClick: () => void
  label?: string
}

export function Fab({ onClick, label = 'Adauga' }: FabProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="fixed right-[calc(var(--safe-r)+16px)] bottom-[calc(var(--app-nav-clearance)+16px)] z-[100000080] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--agri-primary)] text-[var(--agri-primary-contrast)] shadow-xl transition active:scale-95"
    >
      <Plus className="h-6 w-6" />
    </button>
  )
}
