import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EverhourClient, secondsToHours } from '@/lib/everhour'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const from = searchParams.get('from') ?? firstOfMonth.toISOString().split('T')[0]
  const to = searchParams.get('to') ?? today.toISOString().split('T')[0]

  const { data: settings } = await supabase
    .from('integration_settings')
    .select('*')
    .eq('type', 'everhour')
    .eq('is_active', true)
    .single()

  if (!settings?.api_key) {
    return NextResponse.json({ error: 'Everhour API key not configured' }, { status: 400 })
  }

  try {
    const client = new EverhourClient(settings.api_key)
    const entries = await client.getTimeEntries(from, to)

    let imported = 0
    for (const entry of entries) {
      const projectEverhourId = entry.task?.projects?.[0]

      const { data: project } = projectEverhourId
        ? await supabase
            .from('everhour_projects')
            .select('id')
            .eq('everhour_id', projectEverhourId)
            .single()
        : { data: null }

      const { error } = await supabase
        .from('everhour_time_entries')
        .upsert({
          everhour_id: String(entry.id),
          everhour_project_id: project?.id ?? null,
          everhour_user_id: String(entry.user),
          user_id: user.id,
          hours: secondsToHours(entry.time),
          logged_date: entry.date,
          description: entry.comment ?? entry.task?.name ?? null,
        }, { onConflict: 'everhour_id' })

      if (!error) imported++
    }

    return NextResponse.json({ imported, total: entries.length })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Everhour API error' },
      { status: 500 }
    )
  }
}
