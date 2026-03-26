import { createClient } from '@supabase/supabase-js'

/**
 * Admin client for server-side operations (e.g. private storage signed URLs,
 * snapshot persistence, asset uploads).
 *
 * Uses the Supabase service role key, so it bypasses RLS.
 */
export const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

