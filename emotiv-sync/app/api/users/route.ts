import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BASE_PATH } from '@/lib/config'

// Create a user and send an email invitation to authenticate the account.
// Admin only. Uses the service-role key server-side.
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
  const { email, full_name, role } = body as {
    email: string
    full_name?: string
    role?: 'admin' | 'freelancer'
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email no válido' }, { status: 400 })
  }
  const finalRole = role === 'admin' ? 'admin' : 'freelancer'

  let admin
  try {
    admin = createAdminClient()
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Configuración incompleta' },
      { status: 500 }
    )
  }

  const origin = new URL(request.url).origin
  const redirectTo = `${origin}${BASE_PATH}/auth/callback?next=/auth/set-password`

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: full_name ?? null },
    redirectTo,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // The on_auth_user_created trigger already inserted a profile (defaulting to
  // 'freelancer'); set the chosen role and name with the service-role client.
  if (data.user) {
    await admin
      .from('user_profiles')
      .update({ role: finalRole, full_name: full_name ?? null })
      .eq('id', data.user.id)
  }

  return NextResponse.json({ success: true, email })
}
