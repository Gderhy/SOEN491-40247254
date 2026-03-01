/**
 * Health Controller
 * Handles health check and system status endpoints
 */

import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { config } from '../config/env.js';

/**
 * Basic health check endpoint
 * GET /health
 */
export const getHealth = (req: Request, res: Response): void => {
  res.json({ ok: true });
};

/**
 * Detailed health check with Supabase connection test
 * GET /health/detailed
 */
export const getDetailedHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    res.json({
      ok: true,
      environment: config.nodeEnv,
      supabase: {
        connected: !error,
        error: error?.message || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "Health check failed",
      timestamp: new Date().toISOString()
    });
  }
};
