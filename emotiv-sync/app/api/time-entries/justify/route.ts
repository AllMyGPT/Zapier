import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// A freelancer submits a justification for an over-budget entry, moving it
// from 'needs_justification' to 'pending' (awaiting admin approval).
// RLS + the guard_time_entry_status trigger ensure a user can only do this
// for their own entries and cannot self-approve.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, justification } = body as { id: string; justification: string }

  if (!id || !justification || justification.trim().length === 0) {
    return NextResponse.json({ error: 'Falta la justificación' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('everhour_time_entries')
    .update({
      status: 'pending',
      justification: justification.trim(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'needs_justification')
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  if (!data?.length) {
    return NextResponse.json(
      { error: 'La entrada no requiere justificación o no es tuya' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}
