'use client'

import { ChevronDown } from 'lucide-react'

export function FarmSwitcher() {
  return (
    <button
      type="button"
      className="agri-control inline-flex h-10 min-w-36 items-center justify-between gap-2 rounded-xl border-white/40 bg-white/20 px-3 text-sm font-semibold text-white backdrop-blur"
      aria-label="Selecteaza ferma"
    >
      <span className="truncate">Ferma Curenta</span>
      <ChevronDown className="h-4 w-4" />
      <span className="sr-only">TODO: conecteaza cu tenant query</span>
    </button>
  )
}
