import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EverhourClient, secondsToHours } from '@/lib/everhour'
import { reconcileBudgetApproval } from '@/lib/approval'

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

    // Build a lookup map: everhour_user_id -> supabase user_id
    const { data: allProfiles } = await supabase
      .from('user_profiles')
      .select('id, email')

    // everhour_user_id is numeric; we try to match by stored everhour_user_id
    // For users not yet mapped, fall back to the importing admin's id so the
    // entry is still stored, but we preserve everhour_user_id for future mapping.
    const everhourUserToSupabaseId = new Map<string, string>()
    for (const p of allProfiles ?? []) {
      // Will be populated if the user has their everhour user id stored
      everhourUserToSupabaseId.set(p.id, p.id)
    }

    // Also fetch existing entries to find already-mapped everhour_user_ids
    const { data: existingMappings } = await supabase
      .from('everhour_time_entries')
      .select('user_id, everhour_user_id')
      .not('everhour_user_id', 'is', null)

    const everhourIdToUserId = new Map<string, string>()
    for (const m of existingMappings ?? []) {
      if (m.everhour_user_id && m.user_id) {
        everhourIdToUserId.set(m.everhour_user_id, m.user_id)
      }
    }

    const touchedProjectIds = new Set<string>()

    let imported = 0
    for (const entry of entries) {
      const projectEverhourId = entry.task?.projects?.[0]

      const { data: project } = projectEverhourId
        ? await supabase
            .from('everhour_projects')
            .select('id, billable')
            .eq('everhour_id', projectEverhourId)
            .single()
        : { data: null }

      if (project?.id) touchedProjectIds.add(project.id)

      const everhourUserId = String(entry.user)

      // Prefer an already-known mapping, otherwise fall back to admin
      // (admin can later re-assign via the UI if needed)
      const resolvedUserId = everhourIdToUserId.get(everhourUserId) ?? user.id

      // Billable: prefer the task flag, fall back to the project's setting
      const billable = entry.task?.billable ?? project?.billable ?? true

      // New entries are auto-OK ('approved'); the budget reconciliation below
      // flips over-budget projects to 'needs_justification'. Never overwrite an
      // existing decision (admin approval/rejection or a submitted justification).
      const { data: existing } = await supabase
        .from('everhour_time_entries')
        .select('status')
        .eq('everhour_id', String(entry.id))
        .maybeSingle()

      const { error } = await supabase
        .from('everhour_time_entries')
        .upsert({
          everhour_id: String(entry.id),
          everhour_project_id: project?.id ?? null,
          everhour_user_id: everhourUserId,
          user_id: resolvedUserId,
          hours: secondsToHours(entry.time),
          logged_date: entry.date,
          description: entry.comment ?? entry.task?.name ?? null,
          billable,
          status: existing?.status ?? 'approved',
        }, { onConflict: 'everhour_id' })

      if (!error) imported++
    }

    // Apply the budget gate: over-budget projects require justification.
    await reconcileBudgetApproval(supabase, Array.from(touchedProjectIds))

    return NextResponse.json({ imported, total: entries.length })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Everhour API error' },
      { status: 500 }
    )
  }
}
