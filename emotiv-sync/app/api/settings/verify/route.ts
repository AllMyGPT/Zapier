import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api'

export async function POST() {
  const supabase = await createClient()
  const { response } = await requireAdmin(supabase)
  if (response) return response

  const { data: zohoSettings } = await supabase
    .from('integration_settings')
    .select('api_key, extra_config')
    .eq('type', 'zoho')
    .single()

  const result: { zoho: { ok: boolean; error?: string } } = {
    zoho: { ok: false },
  }

  const zohoToken = zohoSettings?.api_key
  const zohoOrgId = (zohoSettings?.extra_config as Record<string, string> | null)?.organization_id
  if (zohoToken && zohoOrgId) {
    try {
      const url = `https://www.zohoapis.eu/books/v3/contacts?organization_id=${encodeURIComponent(zohoOrgId)}&limit=1`
      const res = await fetch(url, {
        headers: { Authorization: `Zoho-oauthtoken ${zohoToken}` },
      })
      if (res.ok) {
        result.zoho = { ok: true }
      } else {
        const body = await res.text()
        result.zoho = { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` }
      }
    } catch (err) {
      result.zoho = { ok: false, error: err instanceof Error ? err.message : 'Network error' }
    }
  } else {
    result.zoho = { ok: false, error: 'Token or organization_id not configured' }
  }

  return NextResponse.json(result)
}
