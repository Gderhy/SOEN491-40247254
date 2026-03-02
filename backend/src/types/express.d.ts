/**
 * Express TypeScript augmentation
 * Adds custom properties to the Express Request type
 */

import type { User } from '@supabase/supabase-js';

// Augment the Express namespace
declare module 'express-serve-static-core' {
  interface Request {
    /**
     * Authenticated user from Supabase JWT token
     * Available after requireAuth middleware validation
     */
    user?: User;
  }
}
