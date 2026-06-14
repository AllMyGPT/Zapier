import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { response } = await requireAdmin(supabase)
  if (response) return response

  const body = await request.json()
  const { everhourKey, zohoToken, zohoOrgId, zohoDefaultCustomerId } = body

  const updates = []

  if (everhourKey !== undefined) {
    updates.push(
      supabase.from('integration_settings').upsert({
        type: 'everhour',
        api_key: everhourKey || null,
        is_active: !!everhourKey,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'type' })
    )
  }

  if (zohoToken !== undefined || zohoOrgId !== undefined || zohoDefaultCustomerId !== undefined) {
    const { data: existing } = await supabase
      .from('integration_settings')
      .select('extra_config')
      .eq('type', 'zoho')
      .single()

    const extraConfig: Record<string, string> = { ...(existing?.extra_config ?? {}) }
    if (zohoOrgId) extraConfig.organization_id = zohoOrgId
    if (zohoDefaultCustomerId !== undefined) {
      if (zohoDefaultCustomerId) {
        extraConfig.default_customer_id = zohoDefaultCustomerId
      } else {
        delete extraConfig.default_customer_id
      }
    }

    updates.push(
      supabase.from('integration_settings').upsert({
        type: 'zoho',
        api_key: zohoToken || null,
        extra_config: extraConfig,
        is_active: !!(zohoToken && extraConfig.organization_id),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'type' })
    )
  }

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)

  if (errors.length) {
    return NextResponse.json({ error: errors[0].error?.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
