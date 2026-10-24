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
  const { name, client_name, status, billable, budget_type, budget_amount, budget_period, hourly_rate, trello_card_id } = body

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) return apiError('Invalid name', 400)
    if (name.length > 200) return apiError('Name too long (max 200 characters)', 400)
  }

  const update: Record<string, unknown> = {}
  if (name !== undefined) update.name = name.trim()
  if (client_name !== undefined) update.client_name = client_name?.trim() || null
  if (status !== undefined) {
    if (!['active', 'archived'].includes(status)) return apiError('Invalid status', 400)
    update.status = status
  }
  if (billable !== undefined) update.billable = billable
  if (budget_type !== undefined) update.budget_type = budget_type || null
  if (budget_amount !== undefined) update.budget_amount = budget_amount || null
  if (budget_period !== undefined) update.budget_period = budget_period || null
  if (hourly_rate !== undefined) update.hourly_rate = hourly_rate || null
  if (trello_card_id !== undefined) update.trello_card_id = trello_card_id || null

  if (Object.keys(update).length === 0) return apiError('No fields to update', 400)

  const { data, error } = await supabase
    .from('everhour_projects')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return apiError('Project not found', 404)
  return NextResponse.json({ project: data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { response } = await requireAdmin(supabase)
  if (response) return response

  const { id } = await params

  const { error } = await supabase
    .from('everhour_projects')
    .update({ status: 'archived' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ archived: true })
}
