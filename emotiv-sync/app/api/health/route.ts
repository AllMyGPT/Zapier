import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  let dbOk = false
  try {
    const { error } = await supabase.from('user_profiles').select('id').limit(1)
    dbOk = !error
  } catch {}

  const { data: settings } = await supabase.from('integration_settings').select('type, is_active')
  const everhourActive = settings?.find(s => s.type === 'everhour')?.is_active ?? false
  const zohoActive = settings?.find(s => s.type === 'zoho')?.is_active ?? false

  return NextResponse.json({
    status: dbOk ? 'ok' : 'degraded',
    supabase: dbOk,
    everhour: everhourActive,
    zoho: zohoActive,
    timestamp: new Date().toISOString(),
  })
}
