/**
 * Health Routes
 * Defines health check and system status routes
 */

import { Router } from 'express';
import { getHealth, getDetailedHealth } from '../controllers/healthController.js';

const router = Router();

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', getHealth);

/**
 * @route   GET /health/detailed  
 * @desc    Detailed health check with Supabase connection test
 * @access  Public
 */
router.get('/detailed', getDetailedHealth);

export default router;
