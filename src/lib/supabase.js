import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/* ---------------------------------------------------------------------------
   The anon key is public by design - Vite bakes it into the bundle. What keeps
   the guest list private is Row Level Security on public.rsvps: there is one
   policy, it allows INSERT, and there is deliberately no SELECT policy.

   So: never read from this table in the browser. No select, no duplicate
   checking, and no .select() chained onto the insert either - under an
   insert-only policy that comes back as an error on a row that actually saved,
   which looks like a failure to the guest.

   Read the list from the Supabase dashboard: Table Editor -> rsvps -> Export.
--------------------------------------------------------------------------- */

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null
