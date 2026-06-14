import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const body = await request.json()
  const { everhourKey, zohoToken, zohoOrgId } = body

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

  if (zohoToken !== undefined || zohoOrgId !== undefined) {
    const { data: existing } = await supabase
      .from('integration_settings')
      .select('extra_config')
      .eq('type', 'zoho')
      .single()

    updates.push(
      supabase.from('integration_settings').upsert({
        type: 'zoho',
        api_key: zohoToken || null,
        extra_config: {
          ...(existing?.extra_config ?? {}),
          ...(zohoOrgId ? { organization_id: zohoOrgId } : {}),
        },
        is_active: !!(zohoToken && zohoOrgId),
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
