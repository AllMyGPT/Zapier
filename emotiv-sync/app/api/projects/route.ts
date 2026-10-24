import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, requireAuth, apiError } from '@/lib/api'

export async function GET() {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  if (!user) return apiError('Unauthorized', 401)

  const { data, error } = await supabase
    .from('everhour_projects')
    .select('id, name, client_name, status, billable, budget_type, budget_amount, budget_period, hourly_rate, zoho_project_id, trello_card_id')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ projects: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { response } = await requireAdmin(supabase)
  if (response) return response

  const body = await request.json()
  const { name, client_name, billable, budget_type, budget_amount, budget_period, hourly_rate, trello_card_id } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return apiError('Project name is required', 400)
  }
  if (name.length > 200) return apiError('Name too long (max 200 characters)', 400)
  if (client_name && typeof client_name === 'string' && client_name.length > 200) {
    return apiError('Client name too long (max 200 characters)', 400)
  }

  const { data, error } = await supabase
    .from('everhour_projects')
    .insert({
      name: name.trim(),
      client_name: client_name?.trim() || null,
      status: 'active',
      billable: billable ?? false,
      budget_type: budget_type || null,
      budget_amount: budget_amount || null,
      budget_period: budget_period || null,
      hourly_rate: hourly_rate || null,
      trello_card_id: trello_card_id || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ project: data }, { status: 201 })
}
