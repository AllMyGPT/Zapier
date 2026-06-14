const ZOHO_BASE = 'https://www.zohoapis.eu/books/v3'
const ZOHO_OAUTH_TOKEN_URL = 'https://accounts.zoho.eu/oauth/v2/token'

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
  private refreshToken?: string
  private clientId?: string
  private clientSecret?: string

  constructor(
    accessToken: string,
    organizationId: string,
    refreshToken?: string,
    clientId?: string,
    clientSecret?: string,
  ) {
    this.accessToken = accessToken
    this.organizationId = organizationId
    this.refreshToken = refreshToken
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken || !this.clientId || !this.clientSecret) {
      throw new Error('Cannot refresh token: missing refreshToken, clientId, or clientSecret')
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })

    const res = await fetch(`${ZOHO_OAUTH_TOKEN_URL}?${params.toString()}`, {
      method: 'POST',
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Zoho token refresh failed ${res.status}: ${body}`)
    }

    const json = await res.json()
    if (!json.access_token) {
      throw new Error('Zoho token refresh did not return an access_token')
    }

    this.accessToken = json.access_token
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = new URL(`${ZOHO_BASE}${path}`)
    url.searchParams.set('organization_id', this.organizationId)

    const doFetch = () =>
      fetch(url.toString(), {
        ...options,
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

    let res = await doFetch()

    // If 401 and we have a refresh token, try refreshing once
    if (res.status === 401 && this.refreshToken && this.clientId && this.clientSecret) {
      try {
        await this.refreshAccessToken()
        res = await doFetch()
      } catch {
        // Refresh failed — fall through to throw the original 401 error
      }
    }

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
