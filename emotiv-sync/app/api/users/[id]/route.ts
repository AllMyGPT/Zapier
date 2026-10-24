import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, apiError } from '@/lib/api'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { response } = await requireAdmin(supabase)
  if (response) return response

  const { id } = await params
  const body = await request.json()
  const { role, weekly_capacity_hours, cost_rate, everhour_user_id, trello_member_id } = body

  // Build the update object from whichever fields were provided
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = {}

  if (role !== undefined) {
    if (!['admin', 'freelancer'].includes(role)) {
      return apiError('Invalid role', 400)
    }
    update.role = role
  }

  if (weekly_capacity_hours !== undefined) {
    if (weekly_capacity_hours !== null) {
      if (typeof weekly_capacity_hours !== 'number' || weekly_capacity_hours < 0) {
        return apiError('weekly_capacity_hours must be a non-negative number', 400)
      }
    }
    update.weekly_capacity_hours = weekly_capacity_hours
  }

  if (cost_rate !== undefined) {
    if (cost_rate !== null) {
      if (typeof cost_rate !== 'number' || cost_rate < 0) {
        return apiError('cost_rate must be a non-negative number', 400)
      }
    }
    update.cost_rate = cost_rate
  }

  if (everhour_user_id !== undefined) {
    update.everhour_user_id = everhour_user_id
  }

  if (trello_member_id !== undefined) {
    update.trello_member_id = trello_member_id || null
  }

  if (Object.keys(update).length === 0) {
    return apiError('No valid fields provided', 400)
  }

  const { error } = await supabase
    .from('user_profiles')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
