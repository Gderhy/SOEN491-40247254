import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

/**
 * Standard anon client — used by the app at runtime.
 * Respects Row Level Security (RLS) policies.
 */
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

/**
 * Super-admin service-role client — bypasses RLS entirely.
 * Use ONLY in trusted server-side scripts (e.g. migrations, run-sql).
 * Never expose this client to the browser or user-facing API handlers.
 */
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Export for use in other modules
export default supabase;
