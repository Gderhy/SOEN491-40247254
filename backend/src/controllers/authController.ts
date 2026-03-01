/**
 * Auth Controller
 * Handles authentication-related endpoints
 */

import type { Request, Response } from 'express';

/**
 * Get current authenticated user information
 * GET /me
 * Requires: requireAuth middleware
 */
export const getCurrentUser = (req: Request, res: Response): void => {
  // req.user is guaranteed to exist after requireAuth middleware
  const user = req.user!;
  
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
    email_confirmed_at: user.email_confirmed_at,
    phone: user.phone || null,
    // Include user metadata if available
    user_metadata: user.user_metadata || {},
    app_metadata: user.app_metadata || {},
    // Additional user info
    aud: user.aud,
    confirmation_sent_at: user.confirmation_sent_at,
    recovery_sent_at: user.recovery_sent_at,
    email_change_sent_at: user.email_change_sent_at,
    new_email: user.new_email,
    invited_at: user.invited_at,
    action_link: user.action_link,
    last_sign_in_at: user.last_sign_in_at
  });
};

/**
 * Validate token endpoint (optional - for frontend to check token validity)
 * GET /auth/validate
 * Requires: requireAuth middleware
 */
export const validateToken = (req: Request, res: Response): void => {
  // If we reach here, the token is valid (requireAuth passed)
  const user = req.user!;
  
  res.json({
    valid: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    },
    timestamp: new Date().toISOString()
  });
};
