import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  Clock3,
  CalendarClock,
  CircleCheckBig,
  CircleX,
  HelpCircle,
} from 'lucide-react'

export type StandardStatus = 'urgent' | 'in_lucru' | 'programat' | 'finalizat' | 'anulat'

export interface StatusConfigItem {
  label: string
  icon: LucideIcon
  className: string
}

export const STATUS_CONFIG: Record<StandardStatus, StatusConfigItem> = {
  urgent: {
    label: 'Urgent',
    icon: AlertTriangle,
    className: 'bg-red-700 text-white border-red-800',
  },
  in_lucru: {
    label: 'In lucru',
    icon: Clock3,
    className: 'bg-amber-500 text-slate-950 border-amber-600',
  },
  programat: {
    label: 'Programat',
    icon: CalendarClock,
    className: 'bg-blue-700 text-white border-blue-800',
  },
  finalizat: {
    label: 'Finalizat',
    icon: CircleCheckBig,
    className: 'bg-emerald-700 text-white border-emerald-800',
  },
  anulat: {
    label: 'Anulat',
    icon: CircleX,
    className: 'bg-slate-700 text-white border-slate-800',
  },
}

export const CUSTOM_STATUS_FALLBACK: StatusConfigItem = {
  label: 'Status',
  icon: HelpCircle,
  className: 'bg-indigo-700 text-white border-indigo-800',
}

const NORMALIZE_MAP: Record<string, StandardStatus> = {
  urgent: 'urgent',
  critica: 'urgent',
  critic: 'urgent',
  in_lucru: 'in_lucru',
  'in lucru': 'in_lucru',
  activ: 'in_lucru',
  programat: 'programat',
  planificat: 'programat',
  finalizat: 'finalizat',
  finalizata: 'finalizat',
  ok: 'finalizat',
  anulat: 'anulat',
  inactiv: 'anulat',
}

export function resolveStatusKey(status: string): StandardStatus | null {
  const key = status.trim().toLowerCase()
  return NORMALIZE_MAP[key] ?? null
}
