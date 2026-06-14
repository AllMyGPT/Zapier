import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // We manage session storage ourselves via Trello Power-Up private data
    persistSession: false,
    autoRefreshToken: false,
  },
})

export interface StoredSession {
  access_token: string
  refresh_token: string
  expires_at?: number
}

export interface TimeEntry {
  id: string
  everhour_project_id: string
  user_id: string
  logged_date: string
  hours: number
  billable: boolean
  description: string | null
  status: string
  timer_started_at: string | null
}

export interface Project {
  id: string
  name: string
  client_name: string | null
  status: string
  billable: boolean
  trello_card_id: string | null
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  trello_member_id: string | null
}

/**
 * Restore a Supabase session from stored tokens.
 * Returns true if session was successfully restored.
 */
export async function restoreSession(session: StoredSession): Promise<boolean> {
  try {
    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    })
    return !error
  } catch {
    return false
  }
}

/**
 * Get the current authenticated user's ID.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

/**
 * Find or create a project linked to a Trello card.
 */
export async function getOrCreateProjectForCard(
  cardId: string,
  cardName: string,
  userId: string,
): Promise<Project | null> {
  // Look up existing project
  const { data: existing, error: findError } = await supabase
    .from('everhour_projects')
    .select('*')
    .eq('trello_card_id', cardId)
    .maybeSingle()

  if (findError) {
    console.error('Error finding project:', findError)
    return null
  }

  if (existing) return existing as Project

  // Create new project linked to this card
  const { data: created, error: createError } = await supabase
    .from('everhour_projects')
    .insert({
      name: cardName,
      trello_card_id: cardId,
      status: 'active',
      billable: false,
      budget_type: null,
      budget_amount: null,
      budget_period: null,
      hourly_rate: null,
      client_name: null,
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating project:', createError)
    return null
  }

  return created as Project
}

/**
 * Get the active timer for a user (timer_started_at IS NOT NULL).
 */
export async function getActiveTimer(userId: string): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from('everhour_time_entries')
    .select('id, timer_started_at, everhour_project_id, description, user_id, logged_date, hours, billable, status')
    .eq('user_id', userId)
    .not('timer_started_at', 'is', null)
    .maybeSingle()

  if (error) {
    console.error('Error getting active timer:', error)
    return null
  }

  return data as TimeEntry | null
}

/**
 * Start a timer for a project.
 */
export async function startTimer(
  projectId: string,
  userId: string,
  description?: string,
): Promise<TimeEntry | null> {
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('everhour_time_entries')
    .insert({
      everhour_project_id: projectId,
      user_id: userId,
      logged_date: today,
      hours: 0,
      billable: false,
      description: description ?? null,
      status: 'approved',
      timer_started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error starting timer:', error)
    return null
  }

  return data as TimeEntry
}

/**
 * Stop the active timer and calculate elapsed hours.
 */
export async function stopTimer(timer: TimeEntry): Promise<TimeEntry | null> {
  const seconds = (Date.now() - new Date(timer.timer_started_at!).getTime()) / 1000
  const hours = Math.round(seconds / 36) / 100 // 2 decimal places

  const { data, error } = await supabase
    .from('everhour_time_entries')
    .update({
      timer_started_at: null,
      hours,
      logged_date: new Date().toISOString().slice(0, 10),
    })
    .eq('id', timer.id)
    .select()
    .single()

  if (error) {
    console.error('Error stopping timer:', error)
    return null
  }

  return data as TimeEntry
}

/**
 * Create a manual time entry.
 */
export async function createManualEntry(
  projectId: string,
  userId: string,
  hours: number,
  loggedDate: string,
  description?: string,
  billable = false,
): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from('everhour_time_entries')
    .insert({
      everhour_project_id: projectId,
      user_id: userId,
      logged_date: loggedDate,
      hours,
      billable,
      description: description ?? null,
      status: 'approved',
      timer_started_at: null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating manual entry:', error)
    return null
  }

  return data as TimeEntry
}

/**
 * Get all time entries for a project (card history).
 */
export async function getProjectTimeEntries(projectId: string): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from('everhour_time_entries')
    .select('*')
    .eq('everhour_project_id', projectId)
    .order('logged_date', { ascending: false })
    .order('id', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching time entries:', error)
    return []
  }

  return (data ?? []) as TimeEntry[]
}

/**
 * Get total hours for a project.
 */
export async function getProjectTotalHours(projectId: string): Promise<number> {
  const { data, error } = await supabase
    .from('everhour_time_entries')
    .select('hours')
    .eq('everhour_project_id', projectId)
    .is('timer_started_at', null)

  if (error || !data) return 0
  return data.reduce((sum, row) => sum + (row.hours ?? 0), 0)
}

/**
 * Get user profiles by IDs.
 */
export async function getUserProfiles(userIds: string[]): Promise<Record<string, UserProfile>> {
  if (userIds.length === 0) return {}

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, role, trello_member_id')
    .in('id', userIds)

  if (error || !data) return {}

  const map: Record<string, UserProfile> = {}
  for (const profile of data as UserProfile[]) {
    map[profile.id] = profile
  }
  return map
}
