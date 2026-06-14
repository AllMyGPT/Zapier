const EVERHOUR_BASE = 'https://api.everhour.com'

interface EverhourBudget {
  type: 'money' | 'time'
  budget: number // money in cents, time in seconds
  period?: 'general' | 'monthly'
  disallowOverbudget?: boolean
}

interface EverhourRate {
  type: string
  rate?: number // cents per hour
}

interface EverhourProject {
  id: string
  name: string
  status: string
  billing?: {
    type: string
    fee?: number // cents
  }
  budget?: EverhourBudget
  rate?: EverhourRate
  cost?: EverhourRate
  client?: {
    id: string
    name: string
  }
}

interface EverhourTimeEntry {
  id: number
  date: string
  time: number
  user: number
  isLocked?: boolean
  task?: {
    id: string
    name: string
    projects?: string[]
    billable?: boolean
  }
  comment?: string
}

interface EverhourUser {
  id: number
  name: string
  email: string
  capacity?: number // weekly seconds
  cost?: number // cents per hour
  rate?: number // cents per hour
  status?: string
}

export class EverhourClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${EVERHOUR_BASE}${path}`, {
      ...options,
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Everhour API error ${res.status}: ${error}`)
    }

    return res.json()
  }

  async getProjects(): Promise<EverhourProject[]> {
    return this.request<EverhourProject[]>('/projects?limit=100')
  }

  async getTimeEntries(from: string, to: string): Promise<EverhourTimeEntry[]> {
    const params = new URLSearchParams({ from, to, limit: '1000' })
    return this.request<EverhourTimeEntry[]>(`/team/time?${params}`)
  }

  async getUsers(): Promise<EverhourUser[]> {
    return this.request<EverhourUser[]>('/team/users')
  }
}

export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 100) / 100
}

export function centsToUnits(cents: number | undefined | null): number | null {
  if (cents == null) return null
  return Math.round(cents) / 100
}

/** Normalises an Everhour project budget into our schema fields. */
export function parseBudget(budget: EverhourBudget | undefined) {
  if (!budget || !budget.budget) {
    return {
      budget_type: null as 'money' | 'hours' | null,
      budget_amount: null as number | null,
      budget_period: 'overall' as 'overall' | 'monthly',
      budget_recurring: false,
      disallow_overbudget: false,
    }
  }
  const isMoney = budget.type === 'money'
  return {
    budget_type: (isMoney ? 'money' : 'hours') as 'money' | 'hours',
    budget_amount: isMoney
      ? Math.round(budget.budget) / 100
      : Math.round((budget.budget / 3600) * 100) / 100,
    budget_period: (budget.period === 'monthly' ? 'monthly' : 'overall') as
      | 'overall'
      | 'monthly',
    budget_recurring: budget.period === 'monthly',
    disallow_overbudget: !!budget.disallowOverbudget,
  }
}
