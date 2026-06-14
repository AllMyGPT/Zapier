import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EverhourClient, centsToUnits, parseBudget } from '@/lib/everhour'

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
    const projects = await client.getProjects()

    let imported = 0
    for (const p of projects) {
      const budget = parseBudget(p.budget)
      const hourlyRate =
        centsToUnits(p.rate?.rate) ?? centsToUnits(p.billing?.fee) ?? null
      const costRate = centsToUnits(p.cost?.rate)

      const { error } = await supabase
        .from('everhour_projects')
        .upsert({
          everhour_id: String(p.id),
          name: p.name,
          client_name: p.client?.name ?? null,
          status: p.status === 'open' ? 'active' : 'archived',
          billable: p.billing?.type === 'hourly' || p.billing?.type === 'fixed',
          hourly_rate: hourlyRate,
          cost_rate: costRate,
          budget_type: budget.budget_type,
          budget_amount: budget.budget_amount,
          budget_period: budget.budget_period,
          budget_recurring: budget.budget_recurring,
          disallow_overbudget: budget.disallow_overbudget,
        }, { onConflict: 'everhour_id' })

      if (!error) imported++
    }

    return NextResponse.json({ imported, total: projects.length })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Everhour API error' },
      { status: 500 }
    )
  }
}
