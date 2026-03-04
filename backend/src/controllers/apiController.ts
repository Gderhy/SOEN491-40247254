/**
 * API Controller
 * Handles general API information endpoints
 */

import type { Request, Response } from 'express';
import { config } from '../config/env.js';
import { sendResponse } from '../utils/response.util.js';
import { HttpStatusCode } from '../config/httpStatus.js';

/**
 * Get API information
 * GET /
 */
export const getApiInfo = (req: Request, res: Response): void => {
  console.log(`[API] GET / - API info requested from ${req.ip}`);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Asset Tracker Backend API',
    data: {
      status: 'running',
      version: '1.0.0',
      environment: config.nodeEnv,
      endpoints: {
        health: '/health',
        detailedHealth: '/health/detailed',
        userInfo: '/me (requires authentication)',
        auth: {
          description: 'Send JWT token via Authorization: Bearer <token>',
          example: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  });
};
