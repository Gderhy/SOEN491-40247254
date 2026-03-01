/**
 * Auth Routes
 * Defines authentication-related routes
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getCurrentUser, validateToken } from '../controllers/authController.js';

const router = Router();

/**
 * @route   GET /me
 * @desc    Get current authenticated user information
 * @access  Private (requires JWT token)
 */
router.get('/me', requireAuth, getCurrentUser);

/**
 * @route   GET /auth/validate
 * @desc    Validate JWT token and return basic user info
 * @access  Private (requires JWT token)
 */
router.get('/auth/validate', requireAuth, validateToken);

export default router;
