import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, apiError } from '@/lib/api'

export async function POST(request: Request) {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json()
  const { project_id, logged_date, hours, billable, description } = body

  if (!project_id || typeof project_id !== 'string') return apiError('project_id is required', 400)
  if (!logged_date || typeof logged_date !== 'string') return apiError('logged_date is required', 400)
  if (!hours || typeof hours !== 'number' || hours <= 0 || hours > 24) {
    return apiError('hours must be a positive number up to 24', 400)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(logged_date)) return apiError('logged_date must be YYYY-MM-DD', 400)
  if (description && typeof description === 'string' && description.length > 1000) {
    return apiError('Description too long (max 1000 characters)', 400)
  }

  // Verify project exists and is active
  const { data: project } = await supabase
    .from('everhour_projects')
    .select('id, status')
    .eq('id', project_id)
    .single()

  if (!project) return apiError('Project not found', 404)
  if (project.status === 'archived') return apiError('Cannot log time to an archived project', 400)

  const { data, error } = await supabase
    .from('everhour_time_entries')
    .insert({
      everhour_project_id: project_id,
      user_id: user.id,
      logged_date,
      hours,
      billable: billable ?? false,
      description: description?.trim() || null,
      status: 'approved',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data }, { status: 201 })
}
