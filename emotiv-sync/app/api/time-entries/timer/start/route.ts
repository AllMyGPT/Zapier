import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, apiError } from '@/lib/api'

export async function POST(request: Request) {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json()
  const { project_id, description } = body

  if (!project_id || typeof project_id !== 'string') return apiError('project_id is required', 400)

  // Verify project is active
  const { data: project } = await supabase
    .from('everhour_projects')
    .select('id, status')
    .eq('id', project_id)
    .single()

  if (!project) return apiError('Project not found', 404)
  if (project.status === 'archived') return apiError('Cannot track time on an archived project', 400)

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('everhour_time_entries')
    .insert({
      everhour_project_id: project_id,
      user_id: user.id,
      logged_date: now.slice(0, 10),
      hours: 0,
      billable: false,
      description: description?.trim() || null,
      status: 'approved',
      timer_started_at: now,
    })
    .select()
    .single()

  if (error) {
    // Unique constraint violation means a timer is already running
    if (error.code === '23505') {
      return apiError('A timer is already running. Stop it before starting a new one.', 409)
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ timer: data }, { status: 201 })
}
