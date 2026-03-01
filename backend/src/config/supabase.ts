import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

// Create Supabase client with environment variables
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

// Export for use in other modules
export default supabase;
