'use client'

import { createClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createClient> | null = null

// Browser-side Supabase client (singleton)
export function getSupabaseBrowserClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase browser environment variables.')
  }

  client = createClient(supabaseUrl, anonKey)
  return client
}
