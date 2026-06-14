import { createClient } from '@/lib/supabase/server'
import { BASE_PATH } from '@/lib/config'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  // Reject anything that isn't a plain relative path to prevent open-redirect.
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes(':')
    ? rawNext
    : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Route handler redirects are raw URLs — prepend the base path manually.
      return NextResponse.redirect(`${origin}${BASE_PATH}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}${BASE_PATH}/auth/login?error=auth_callback_failed`)
}
