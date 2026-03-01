import { createClient } from '@supabase/supabase-js';
import { config } from './env';

// Create Supabase client with environment variables
export const supabase = createClient(
  config.supabase.url,
  config.supabase.publishableKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Export for use in other modules
export default supabase;
