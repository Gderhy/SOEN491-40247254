/**
 * Express TypeScript augmentation
 * Adds custom properties to the Express Request type
 */

import type { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user from Supabase JWT token
       * Available after requireAuth middleware validation
       */
      user?: User;
    }
  }
}

export {}; // Make this file a module
