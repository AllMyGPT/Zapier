const EVERHOUR_BASE = 'https://api.everhour.com'

interface EverhourProject {
  id: string
  name: string
  status: string
  billing?: {
    type: string
    fee?: number
  }
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
  task?: {
    id: string
    name: string
    projects?: string[]
  }
  comment?: string
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
    return this.request<EverhourTimeEntry[]>(
      `/team/time?from=${from}&to=${to}&limit=500`
    )
  }

  async getUsers() {
    return this.request('/team/users')
  }
}

export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 100) / 100
}
