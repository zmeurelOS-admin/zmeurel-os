export interface ProfitCalculation {
  revenue: number
  cost: number
  profit: number
  margin: number
}

export function calculateProfit(revenue: number, cost: number): ProfitCalculation {
  const safeRevenue = Number.isFinite(revenue) ? revenue : 0
  const safeCost = Number.isFinite(cost) ? cost : 0
  const profit = safeRevenue - safeCost
  const margin = safeRevenue > 0 ? (profit / safeRevenue) * 100 : 0

  return {
    revenue: safeRevenue,
    cost: safeCost,
    profit,
    margin,
  }
}
