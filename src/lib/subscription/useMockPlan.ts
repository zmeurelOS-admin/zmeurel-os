'use client'

import { useEffect, useState } from 'react'

import {
  readStoredPlan,
  writeStoredPlan,
  type SubscriptionPlan,
} from '@/lib/subscription/plans'

export function useMockPlan() {
  const [plan, setPlan] = useState<SubscriptionPlan>('basic')

  useEffect(() => {
    setPlan(readStoredPlan())
  }, [])

  const updatePlan = (nextPlan: SubscriptionPlan) => {
    setPlan(nextPlan)
    writeStoredPlan(nextPlan)
  }

  return { plan, setPlan: updatePlan }
}
