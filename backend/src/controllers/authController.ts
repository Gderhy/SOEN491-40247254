/**
 * Auth Controller
 * Handles authentication-related endpoints
 */

import type { Request, Response } from 'express';
import { sendResponse } from '../utils/response.util.js';
import { HttpStatusCode, SuccessMessage } from '../config/index.js';

/**
 * Get current authenticated user information
 * GET /me
 * Requires: requireAuth middleware
 */
export const getCurrentUser = (req: Request, res: Response): void => {
  const user = (req as any).user!;
  console.log(`[Auth] GET /me - User info requested for user: ${user.id}`);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.USER_RETRIEVED,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email_confirmed_at: user.email_confirmed_at,
      phone: user.phone || null,
      user_metadata: user.user_metadata || {},
      app_metadata: user.app_metadata || {},
      aud: user.aud,
      confirmation_sent_at: user.confirmation_sent_at,
      recovery_sent_at: user.recovery_sent_at,
      email_change_sent_at: user.email_change_sent_at,
      new_email: user.new_email,
      invited_at: user.invited_at,
      action_link: user.action_link,
      last_sign_in_at: user.last_sign_in_at
    }
  });
};

/**
 * Validate token endpoint
 * GET /auth/validate
 * Requires: requireAuth middleware
 */
export const validateToken = (req: Request, res: Response): void => {
  const user = (req as any).user!;
  console.log(`[Auth] GET /auth/validate - Token validated for user: ${user.id}`);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.TOKEN_VALID,
    data: {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      timestamp: new Date().toISOString()
    }
  });
};
