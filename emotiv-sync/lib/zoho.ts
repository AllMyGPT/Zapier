const ZOHO_BASE = 'https://www.zohoapis.eu/books/v3'

interface ZohoProject {
  project_id: string
  project_name: string
  customer_id: string
  customer_name: string
  status: string
  billing_type: string
  rate?: number
  description?: string
}

interface ZohoTimeEntry {
  time_entry_id: string
  project_id: string
  task_id?: string
  user_id: string
  log_date: string
  hours: number
  notes?: string
  is_billable: boolean
}

export class ZohoClient {
  private accessToken: string
  private organizationId: string

  constructor(accessToken: string, organizationId: string) {
    this.accessToken = accessToken
    this.organizationId = organizationId
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = new URL(`${ZOHO_BASE}${path}`)
    url.searchParams.set('organization_id', this.organizationId)

    const res = await fetch(url.toString(), {
      ...options,
      headers: {
        Authorization: `Zoho-oauthtoken ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Zoho API error ${res.status}: ${error}`)
    }

    return res.json()
  }

  async getProjects(): Promise<{ projects: ZohoProject[] }> {
    return this.request<{ projects: ZohoProject[] }>('/projects')
  }

  async createProject(data: Partial<ZohoProject>) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logTime(projectId: string, entry: Partial<ZohoTimeEntry>) {
    return this.request(`/projects/${projectId}/timelogs`, {
      method: 'POST',
      body: JSON.stringify(entry),
    })
  }

  async getTimeLogs(projectId: string) {
    return this.request(`/projects/${projectId}/timelogs`)
  }

  async getContacts() {
    return this.request<{ contacts: Array<{ contact_id: string; contact_name: string }> }>(
      '/contacts?contact_type=customer'
    )
  }
}
