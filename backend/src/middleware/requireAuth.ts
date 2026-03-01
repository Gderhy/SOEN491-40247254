/**
 * JWT Authentication Middleware for Supabase
 * Validates JWT tokens and attaches user to request object
 */

import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

/**
 * Middleware to require authentication via Supabase JWT
 * Validates the Authorization Bearer token and attaches user to req.user
 * 
 * Usage:
 * app.get('/protected-route', requireAuth, (req, res) => {
 *   console.log(req.user); // Authenticated user object
 * });
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Missing Authorization header'
      });
      return;
    }

    // Check Bearer token format
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
    if (!tokenMatch) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid Authorization header format. Expected: Bearer <token>'
      });
      return;
    }

    const token = tokenMatch[1];

    // Validate token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error('Token validation failed:', error?.message);
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
      return;
    }

    // Attach user to request object
    (req as any).user = data.user;
    
    // Continue to next middleware/route handler
    next();
    
  } catch (err) {
    console.error('Authentication middleware error:', err);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to process authentication'
    });
  }
}

/**
 * Optional: Middleware for routes that may have authenticated users but don't require it
 * Attaches user if token is valid, but doesn't fail if missing/invalid
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const tokenMatch = authHeader?.match(/^Bearer\s+(.+)$/);
    
    if (tokenMatch) {
      const token = tokenMatch[1];
      const { data, error } = await supabase.auth.getUser(token);
      
      if (!error && data.user) {
        (req as any).user = data.user;
      }
    }
    
    next();
  } catch (err) {
    // Silently continue without user for optional auth
    next();
  }
}
