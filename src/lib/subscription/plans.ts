export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise'

export type SubscriptionFeature =
  | 'advanced_reports'
  | 'smart_alerts'
  | 'full_season_export'

export const PLAN_STORAGE_KEY = 'agri.subscription.plan'

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

const FEATURE_MATRIX: Record<SubscriptionPlan, SubscriptionFeature[]> = {
  basic: [],
  pro: ['advanced_reports', 'smart_alerts', 'full_season_export'],
  enterprise: ['advanced_reports', 'smart_alerts', 'full_season_export'],
}

export function hasFeature(plan: SubscriptionPlan, feature: SubscriptionFeature): boolean {
  return FEATURE_MATRIX[plan].includes(feature)
}

export function readStoredPlan(): SubscriptionPlan {
  if (typeof window === 'undefined') return 'basic'
  const raw = window.localStorage.getItem(PLAN_STORAGE_KEY)
  if (raw === 'basic' || raw === 'pro' || raw === 'enterprise') return raw
  return 'basic'
}

export function writeStoredPlan(plan: SubscriptionPlan) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PLAN_STORAGE_KEY, plan)
}
