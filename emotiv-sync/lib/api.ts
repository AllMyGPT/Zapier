import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function requireAuth(supabase: SupabaseClient<any, any, any>) {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAdmin(supabase: SupabaseClient<any, any, any>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null, response: apiError('Unauthorized', 401) }
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { user, profile, response: apiError('Forbidden', 403) }
  return { user, profile, response: null }
}
