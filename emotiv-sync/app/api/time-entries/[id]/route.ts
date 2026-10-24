import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, apiError } from '@/lib/api'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  if (!user) return apiError('Unauthorized', 401)

  const { id } = await params
  const body = await request.json()
  const { logged_date, hours, billable, description, justification, status } = body

  // Fetch entry to check ownership and lock status
  const { data: entry } = await supabase
    .from('everhour_time_entries')
    .select('id, user_id, approved_by, synced_at, status')
    .eq('id', id)
    .single()

  if (!entry) return apiError('Entry not found', 404)
  if (entry.user_id !== user.id) return apiError('Forbidden', 403)

  // Justification submit: special path allowed even when admin-decided
  if (status === 'pending' && entry.status === 'needs_justification') {
    if (!justification || typeof justification !== 'string' || justification.trim().length === 0) {
      return apiError('Justification is required', 400)
    }
    const { data, error } = await supabase
      .from('everhour_time_entries')
      .update({ status: 'pending', justification: justification.trim() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ entry: data })
  }

  // Content edits only on unlocked entries
  if (entry.approved_by !== null || entry.synced_at !== null) {
    return apiError('This entry is locked', 403)
  }

  const update: Record<string, unknown> = {}
  if (hours !== undefined) {
    if (typeof hours !== 'number' || hours <= 0 || hours > 24) {
      return apiError('hours must be a positive number up to 24', 400)
    }
    update.hours = hours
  }
  if (logged_date !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(logged_date)) return apiError('logged_date must be YYYY-MM-DD', 400)
    update.logged_date = logged_date
  }
  if (billable !== undefined) update.billable = billable
  if (description !== undefined) {
    if (description && description.length > 1000) return apiError('Description too long (max 1000 characters)', 400)
    update.description = description?.trim() || null
  }

  if (Object.keys(update).length === 0) return apiError('No fields to update', 400)

  const { data, error } = await supabase
    .from('everhour_time_entries')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  if (!user) return apiError('Unauthorized', 401)

  const { id } = await params

  const { data: entry } = await supabase
    .from('everhour_time_entries')
    .select('id, user_id, approved_by, synced_at')
    .eq('id', id)
    .single()

  if (!entry) return apiError('Entry not found', 404)
  if (entry.user_id !== user.id) return apiError('Forbidden', 403)
  if (entry.approved_by !== null || entry.synced_at !== null) {
    return apiError('Cannot delete a locked entry', 403)
  }

  const { error } = await supabase
    .from('everhour_time_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .is('approved_by', null)
    .is('synced_at', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
