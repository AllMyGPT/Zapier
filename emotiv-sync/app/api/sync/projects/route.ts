import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZohoClient } from '@/lib/zoho'

export async function POST() {
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

  const { data: zohoSettings } = await supabase
    .from('integration_settings')
    .select('*')
    .eq('type', 'zoho')
    .eq('is_active', true)
    .single()

  if (!zohoSettings?.api_key || !zohoSettings?.extra_config?.organization_id) {
    return NextResponse.json({ error: 'Zoho Books not configured' }, { status: 400 })
  }

  const { data: projects } = await supabase
    .from('everhour_projects')
    .select('*')
    .is('zoho_project_id', null)
    .eq('status', 'active')

  if (!projects?.length) {
    return NextResponse.json({ synced: 0, message: 'No pending projects' })
  }

  const zoho = new ZohoClient(zohoSettings.api_key, zohoSettings.extra_config.organization_id)

  let synced = 0
  let failed = 0
  const errors: string[] = []

  for (const project of projects) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await zoho.createProject({
        project_name: project.name,
        billing_type: project.billable ? 'hourly' : 'non_billable',
        rate: project.hourly_rate ?? undefined,
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = result as any
      if (r?.project?.project_id) {
        await supabase
          .from('everhour_projects')
          .update({
            zoho_project_id: r.project.project_id,
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', project.id)
        synced++
      }
    } catch (err: unknown) {
      failed++
      errors.push(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  await supabase.from('sync_logs').insert({
    sync_type: 'projects',
    direction: 'everhour_to_zoho',
    status: failed === 0 ? 'success' : synced === 0 ? 'error' : 'partial',
    message: errors.length ? errors.slice(0, 3).join('; ') : null,
    records_processed: synced,
    records_failed: failed,
    created_by: user.id,
  })

  return NextResponse.json({ synced, failed, total: projects.length })
}
