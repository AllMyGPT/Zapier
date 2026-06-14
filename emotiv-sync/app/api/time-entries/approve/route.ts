import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Bulk approve / reject time entries. Admin only.
// Body: { ids: string[], action: 'approve' | 'reject', reason?: string }
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
  const { ids, action, reason } = body as {
    ids: string[]
    action: 'approve' | 'reject'
    reason?: string
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No entries selected' }, { status: 400 })
  }
  if (ids.length > 500) {
    return NextResponse.json({ error: 'Too many entries in a single request (max 500)' }, { status: 400 })
  }
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  if (reason && reason.length > 1000) {
    return NextResponse.json({ error: 'Reason too long (max 1000 characters)' }, { status: 400 })
  }

  // Never re-decide entries already pushed to Zoho.
  const update =
    action === 'approve'
      ? {
          status: 'approved' as const,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
        }
      : {
          status: 'rejected' as const,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason ?? null,
        }

  const { data, error } = await supabase
    .from('everhour_time_entries')
    .update(update)
    .in('id', ids)
    .is('synced_at', null)
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ updated: data?.length ?? 0, action })
}
