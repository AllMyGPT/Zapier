import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for privileged server-side operations
 * (inviting users, assigning roles). NEVER import this in client components.
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set in the environment.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY no está configurada. Añádela en las variables de entorno.'
    )
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
