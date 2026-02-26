'use client'

import { useSentryUser } from '@/lib/monitoring/useSentryUser'

export function MonitoringInit() {
  useSentryUser()
  return null
}
