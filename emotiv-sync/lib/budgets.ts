import type { EverhourProject, TimeEntry } from '@/types'

export type BudgetLevel = 'none' | 'ok' | 'warning' | 'over'

export interface BudgetStatus {
  hasBudget: boolean
  type: 'money' | 'hours' | null
  limit: number
  consumed: number
  remaining: number
  percent: number
  level: BudgetLevel
}

export const BUDGET_WARNING_THRESHOLD = 80 // %

/**
 * Computes budget consumption for a project from its time entries.
 * - Money budgets consume billable_hours * hourly_rate.
 * - Hour budgets consume all tracked hours.
 * - Monthly/recurring budgets only count entries in the current calendar month.
 */
export function computeBudgetStatus(
  project: Pick<
    EverhourProject,
    'budget_type' | 'budget_amount' | 'budget_period' | 'hourly_rate'
  >,
  entries: Pick<TimeEntry, 'hours' | 'logged_date' | 'billable'>[]
): BudgetStatus {
  if (!project.budget_type || !project.budget_amount) {
    return {
      hasBudget: false,
      type: null,
      limit: 0,
      consumed: 0,
      remaining: 0,
      percent: 0,
      level: 'none',
    }
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const relevant =
    project.budget_period === 'monthly'
      ? entries.filter((e) => new Date(e.logged_date) >= monthStart)
      : entries

  let consumed: number
  if (project.budget_type === 'money') {
    const rate = project.hourly_rate ?? 0
    consumed = relevant.reduce(
      (sum, e) => sum + (e.billable ? e.hours * rate : 0),
      0
    )
  } else {
    consumed = relevant.reduce((sum, e) => sum + e.hours, 0)
  }

  consumed = Math.round(consumed * 100) / 100
  const limit = project.budget_amount
  const percent = limit > 0 ? Math.round((consumed / limit) * 100) : 0
  const remaining = Math.round((limit - consumed) * 100) / 100

  let level: BudgetLevel = 'ok'
  if (percent >= 100) level = 'over'
  else if (percent >= BUDGET_WARNING_THRESHOLD) level = 'warning'

  return {
    hasBudget: true,
    type: project.budget_type,
    limit,
    consumed,
    remaining,
    percent,
    level,
  }
}

export interface Profitability {
  hours: number
  billableHours: number
  nonBillableHours: number
  revenue: number
  cost: number
  profit: number
  margin: number // %
  billablePercent: number
}

/**
 * Computes revenue/cost/profit for a set of entries.
 * revenue = billable_hours * bill_rate; cost = hours * cost_rate.
 */
export function computeProfitability(
  entries: Pick<TimeEntry, 'hours' | 'billable'>[],
  billRate: number,
  costRate: number
): Profitability {
  let hours = 0
  let billableHours = 0
  let revenue = 0
  let cost = 0

  for (const e of entries) {
    hours += e.hours
    cost += e.hours * costRate
    if (e.billable) {
      billableHours += e.hours
      revenue += e.hours * billRate
    }
  }

  const nonBillableHours = Math.round((hours - billableHours) * 100) / 100
  const profit = revenue - cost
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
  const billablePercent = hours > 0 ? Math.round((billableHours / hours) * 100) : 0

  return {
    hours: Math.round(hours * 100) / 100,
    billableHours: Math.round(billableHours * 100) / 100,
    nonBillableHours,
    revenue: Math.round(revenue * 100) / 100,
    cost: Math.round(cost * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    margin,
    billablePercent,
  }
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}
