import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZohoClient } from '@/lib/zoho'
import { requireAdmin, apiError } from '@/lib/api'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { user, response } = await requireAdmin(supabase)
  if (response) return response

  const { searchParams } = new URL(request.url)
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
  const rawFrom = searchParams.get('from') ?? ''
  const rawTo = searchParams.get('to') ?? ''
  const from = DATE_RE.test(rawFrom) ? rawFrom : firstOfMonth.toISOString().split('T')[0]
  const to = DATE_RE.test(rawTo) ? rawTo : today.toISOString().split('T')[0]

  const { data: zohoSettings } = await supabase
    .from('integration_settings')
    .select('*')
    .eq('type', 'zoho')
    .eq('is_active', true)
    .single()

  if (!zohoSettings?.api_key || !zohoSettings?.extra_config?.organization_id) {
    return apiError('Zoho Books not configured', 400)
  }

  const { data: entries } = await supabase
    .from('everhour_time_entries')
    .select(`*, project:everhour_projects(zoho_project_id)`)
    .is('synced_at', null)
    .eq('status', 'approved')
    .gte('logged_date', from)
    .lte('logged_date', to)
    .not('everhour_project_id', 'is', null)

  if (!entries?.length) {
    return NextResponse.json({ synced: 0, message: 'No approved time entries pending sync' })
  }

  const zohoExtra = zohoSettings.extra_config as Record<string, string>
  const zoho = new ZohoClient(
    zohoSettings.api_key,
    zohoExtra.organization_id,
    zohoExtra.refresh_token,
    process.env.ZOHO_CLIENT_ID,
    process.env.ZOHO_CLIENT_SECRET,
  )

  let synced = 0
  let failed = 0
  const errors: string[] = []

  for (const entry of entries) {
    const zohoProjectId = entry.project?.zoho_project_id
    if (!zohoProjectId) continue

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await zoho.logTime(zohoProjectId, {
        log_date: entry.logged_date,
        hours: entry.hours,
        notes: entry.description ?? undefined,
        is_billable: entry.billable ?? true,
      })

      if (result?.time_entry?.time_entry_id) {
        await supabase
          .from('everhour_time_entries')
          .update({
            zoho_timesheet_id: result.time_entry.time_entry_id,
            synced_at: new Date().toISOString(),
          })
          .eq('id', entry.id)
        synced++
      }
    } catch (err: unknown) {
      failed++
      errors.push(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  await supabase.from('sync_logs').insert({
    sync_type: 'time_entries',
    direction: 'everhour_to_zoho',
    status: failed === 0 ? 'success' : synced === 0 ? 'error' : 'partial',
    message: errors.length ? errors.slice(0, 3).join('; ') : null,
    records_processed: synced,
    records_failed: failed,
    created_by: user.id,
  })

  return NextResponse.json({ synced, failed, total: entries.length })
}
