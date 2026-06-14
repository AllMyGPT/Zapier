import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, apiError } from '@/lib/api'

export async function POST() {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  if (!user) return apiError('Unauthorized', 401)

  // Find the running timer
  const { data: timer } = await supabase
    .from('everhour_time_entries')
    .select('id, timer_started_at, everhour_project_id')
    .eq('user_id', user.id)
    .not('timer_started_at', 'is', null)
    .single()

  if (!timer) return apiError('No active timer', 404)

  const startedAt = new Date(timer.timer_started_at)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
  const hours = Math.max(seconds / 3600, 0.01)

  const { data, error } = await supabase
    .from('everhour_time_entries')
    .update({
      timer_started_at: null,
      hours: Math.round(hours * 100) / 100,
      logged_date: now.toISOString().slice(0, 10),
    })
    .eq('id', timer.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    entry: data,
    duration_seconds: seconds,
    hours: Math.round(hours * 100) / 100,
  })
}
