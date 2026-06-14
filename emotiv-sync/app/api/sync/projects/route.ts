import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZohoClient } from '@/lib/zoho'

// Zoho Books billing_type accepted values:
// based_on_project_hours | based_on_staff_hours | based_on_task_hours | fixed_cost_for_project
function toBillingType(billable: boolean, hasHourlyRate: boolean): string {
  if (!billable) return 'based_on_project_hours' // non-billable still needs a valid type
  return hasHourlyRate ? 'based_on_project_hours' : 'fixed_cost_for_project'
}

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

  // Fetch existing Zoho customers to resolve client_name → customer_id
  let zohoCustomers: Array<{ customer_id: string; customer_name: string }> = []
  try {
    const contactsRes: { contacts?: Array<{ contact_id: string; contact_name: string }> } =
      await zoho.getContacts()
    zohoCustomers = (contactsRes.contacts ?? []).map(c => ({
      customer_id: c.contact_id,
      customer_name: c.contact_name,
    }))
  } catch {
    // Non-fatal: projects without a matched customer will be skipped with an error
  }

  const defaultCustomerId = zohoSettings.extra_config?.default_customer_id as string | undefined

  let synced = 0
  let failed = 0
  const errors: string[] = []

  for (const project of projects) {
    // Resolve customer_id: match by client_name, fall back to configured default
    const customerId =
      zohoCustomers.find(
        c => c.customer_name.toLowerCase() === (project.client_name ?? '').toLowerCase()
      )?.customer_id ?? defaultCustomerId

    if (!customerId) {
      failed++
      errors.push(`${project.name}: no customer_id found (set default_customer_id in settings)`)
      continue
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await zoho.createProject({
        project_name: project.name,
        customer_id: customerId,
        billing_type: toBillingType(project.billable, !!project.hourly_rate),
        rate: project.hourly_rate ?? undefined,
        description: `Imported from Everhour (${project.everhour_id})`,
      })

      if (result?.project?.project_id) {
        await supabase
          .from('everhour_projects')
          .update({
            zoho_project_id: result.project.project_id,
            zoho_customer_id: customerId,
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', project.id)
        synced++
      } else {
        failed++
        errors.push(`${project.name}: Zoho did not return a project_id`)
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
