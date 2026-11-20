import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null | undefined;
export function supabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'pizarra';
  client = url && key ? (createClient(url, key, { db: { schema }, auth: { persistSession: true, autoRefreshToken: true, storageKey: 'pizarra-auth' } }) as unknown as SupabaseClient) : null;
  return client;
}
