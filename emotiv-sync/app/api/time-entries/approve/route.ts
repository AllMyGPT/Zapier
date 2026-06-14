import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api'
import { notifyApproval } from '@/lib/mailer'

// Bulk approve / reject time entries. Admin only.
// Body: { ids: string[], action: 'approve' | 'reject', reason?: string }
export async function POST(request: Request) {
  const supabase = await createClient()
  const { user, response } = await requireAdmin(supabase)
  if (response) return response

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
          approved_by: user!.id,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
        }
      : {
          status: 'rejected' as const,
          approved_by: user!.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason ?? null,
        }

  const { data, error } = await supabase
    .from('everhour_time_entries')
    .update(update)
    .in('id', ids)
    .is('synced_at', null)
    .select('id, user_id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Insert audit log entry
  await supabase.from('audit_log').insert({
    actor_id: user!.id,
    action: action === 'approve' ? 'approve_entries' : 'reject_entries',
    target_table: 'everhour_time_entries',
    metadata: { ids_count: data?.length ?? 0, reason: reason ?? null },
  })

  // Send email notifications to affected users (fire-and-forget)
  try {
    const updatedCount = data?.length ?? 0
    if (updatedCount > 0) {
      // Gather unique user_ids from updated entries
      const userIds = [...new Set((data ?? []).map(e => e.user_id).filter(Boolean))]

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, email')
        .in('id', userIds)

      for (const profile of profiles ?? []) {
        if (profile.email) {
          await notifyApproval(profile.email, updatedCount, action === 'approve', reason)
        }
      }
    }
  } catch {
    // Non-fatal: notification failure must not break the response
  }

  return NextResponse.json({ updated: data?.length ?? 0, action })
}
