export type UserRole = 'admin' | 'freelancer'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface EverhourProject {
  id: string
  everhour_id: string
  zoho_project_id: string | null
  zoho_customer_id: string | null
  name: string
  client_name: string | null
  status: 'active' | 'archived' | 'pending_sync'
  billable: boolean
  hourly_rate: number | null
  last_synced_at: string | null
  created_at: string
}

export interface TimeEntry {
  id: string
  everhour_project_id: string | null
  user_id: string
  everhour_user_id: string | null
  hours: number
  logged_date: string
  description: string | null
  everhour_id: string | null
  zoho_timesheet_id: string | null
  synced_at: string | null
  created_at: string
  project?: EverhourProject
  user?: UserProfile
}

export interface SyncLog {
  id: string
  sync_type: 'projects' | 'time_entries'
  direction: 'everhour_to_zoho' | 'zoho_to_everhour'
  status: 'success' | 'error' | 'partial'
  message: string | null
  records_processed: number
  records_failed: number
  created_at: string
  created_by: string | null
}

export interface IntegrationSetting {
  id: string
  type: 'everhour' | 'zoho'
  api_key: string | null
  extra_config: Record<string, string> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SyncStats {
  totalProjects: number
  syncedProjects: number
  pendingProjects: number
  totalTimeEntries: number
  syncedTimeEntries: number
  lastSyncAt: string | null
}
