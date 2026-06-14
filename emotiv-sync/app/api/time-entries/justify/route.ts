import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, apiError } from '@/lib/api'
import { notifyJustificationSubmitted } from '@/lib/mailer'

// A freelancer submits a justification for an over-budget entry, moving it
// from 'needs_justification' to 'pending' (awaiting admin approval).
// RLS + the guard_time_entry_status trigger ensure a user can only do this
// for their own entries and cannot self-approve.
export async function POST(request: Request) {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json()
  const { id, justification } = body as { id: string; justification: string }

  if (!id || !justification || justification.trim().length === 0) {
    return NextResponse.json({ error: 'Falta la justificación' }, { status: 400 })
  }
  if (justification.trim().length > 2000) {
    return NextResponse.json({ error: 'Justificación demasiado larga (máx. 2000 caracteres)' }, { status: 400 })
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

  // Notify the first admin about the pending justification (fire-and-forget)
  try {
    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (adminProfile?.email) {
      const { data: freelancerProfile } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      const freelancerName = freelancerProfile?.full_name ?? freelancerProfile?.email ?? 'Un freelancer'
      await notifyJustificationSubmitted(adminProfile.email, freelancerName, data.length)
    }
  } catch {
    // Non-fatal: notification failure must not break the response
  }

  return NextResponse.json({ success: true })
}
