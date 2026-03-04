/**
 * Health Controller
 * Handles health check and system status endpoints
 */

import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { config } from '../config/env.js';
import { sendResponse } from '../utils/response.util.js';
import { HttpStatusCode } from '../config/httpStatus.js';

/**
 * Basic health check endpoint
 * GET /health
 */
export const getHealth = (req: Request, res: Response): void => {
  console.log(`[Health] GET /health - Basic health check from ${req.ip}`);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Service is healthy',
    data: { ok: true }
  });
};

/**
 * Detailed health check with Supabase connection test
 * GET /health/detailed
 */
export const getDetailedHealth = async (req: Request, res: Response): Promise<void> => {
  console.log(`[Health] GET /health/detailed - Detailed health check from ${req.ip}`);

  try {
    const { error } = await supabase.auth.getSession();

    const dbConnected = !error;
    console.log(`[Health] Supabase connection: ${dbConnected ? 'OK' : `FAILED - ${error?.message}`}`);

    sendResponse(res, {
      statusCode: HttpStatusCode.OK,
      message: 'Detailed health check complete',
      data: {
        ok: true,
        environment: config.nodeEnv,
        supabase: {
          connected: dbConnected,
          error: error?.message || null
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Health] GET /health/detailed - Health check failed: ${message}`);

    sendResponse(res, {
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      message: 'Health check failed',
      data: {
        ok: false,
        error: message,
        timestamp: new Date().toISOString()
      }
    });
  }
};
