/**
 * API Routes
 * Defines general API information routes
 */

import { Router } from 'express';
import { getApiInfo } from '../controllers/apiController.js';

const router = Router();

/**
 * @route   GET /
 * @desc    Get API information and available endpoints
 * @access  Public
 */
router.get('/', getApiInfo);

export default router;
