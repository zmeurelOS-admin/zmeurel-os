'use client'

import { Plus } from 'lucide-react'

interface FabProps {
  onClick: () => void
}

export function Fab({ onClick }: FabProps) {
  return (
    <button
      type="button"
      aria-label="Adauga parcela"
      onClick={onClick}
      className="fixed right-[calc(var(--safe-r)+16px)] bottom-[calc(var(--safe-b)+var(--mobile-nav-h)+16px)] z-[100000110] flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition active:scale-95"
    >
      <Plus className="h-6 w-6" />
    </button>
  )
}
