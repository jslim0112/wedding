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

/**
 * The public URL of a file in a public Storage bucket, so config.js can name a
 * file ('our-song.mp3') instead of carrying a hundred-character URL. Reading a
 * public object needs no request and no key beyond the anon one already here.
 * Returns '' when the bucket or file name is missing, or when Supabase is not
 * configured yet - every caller treats '' as "nothing to show".
 */
export function publicUrl(bucket, path) {
  if (!supabase || !bucket || !path) return ''
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl || ''
}
