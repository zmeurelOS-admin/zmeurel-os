'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Tractor } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

interface FarmSwitcherProps {
  variant?: 'chip' | 'panel'
  onActivate?: () => void
}

function useCurrentFarmLabel() {
  const [farmName, setFarmName] = useState('Ferma curenta')

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const loadFarm = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user?.id || !mounted) return

      const { data: tenant } = await supabase
        .from('tenants')
        .select('nume_ferma')
        .eq('owner_user_id', session.user.id)
        .single()

      if (tenant?.nume_ferma && mounted) {
        setFarmName(tenant.nume_ferma)
      }
    }

    void loadFarm()
    return () => {
      mounted = false
    }
  }, [])

  return farmName
}

export function FarmSwitcher({ variant = 'panel', onActivate }: FarmSwitcherProps) {
  const farmName = useCurrentFarmLabel()

  const label = useMemo(() => farmName || 'Ferma curenta', [farmName])

  if (variant === 'chip') {
    return (
      <button
        type="button"
        onClick={onActivate}
        className="agri-control inline-flex h-9 max-w-[190px] items-center gap-2 rounded-full border border-[var(--agri-border)] bg-white px-3 text-xs font-semibold text-[var(--agri-text)]"
        aria-label="Schimba ferma"
      >
        <Tractor className="h-3.5 w-3.5 text-emerald-700" />
        <span className="truncate">{label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-[var(--agri-text-muted)]" />
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--agri-text-muted)]">Ferma activa</p>
      <div className="agri-control flex h-12 items-center justify-between rounded-xl border px-3">
        <span className="truncate text-sm font-semibold text-[var(--agri-text)]">{label}</span>
        <ChevronDown className="h-4 w-4 text-[var(--agri-text-muted)]" />
      </div>
      <p className="text-xs text-[var(--agri-text-muted)]">Selectia fermei foloseste fluxul existent de tenant.</p>
    </div>
  )
}
