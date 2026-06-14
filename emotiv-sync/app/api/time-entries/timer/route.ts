import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, apiError } from '@/lib/api'

export async function GET() {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  if (!user) return apiError('Unauthorized', 401)

  const { data, error } = await supabase
    .from('everhour_time_entries')
    .select('id, timer_started_at, everhour_project_id, description, everhour_projects(name)')
    .eq('user_id', user.id)
    .not('timer_started_at', 'is', null)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) return NextResponse.json({ timer: null })

  const elapsed = Math.floor(
    (Date.now() - new Date(data.timer_started_at).getTime()) / 1000
  )

  return NextResponse.json({
    timer: {
      id: data.id,
      project_id: data.everhour_project_id,
      project_name: (data.everhour_projects as unknown as { name: string } | null)?.name ?? null,
      started_at: data.timer_started_at,
      elapsed_seconds: elapsed,
      description: data.description,
    },
  })
}
