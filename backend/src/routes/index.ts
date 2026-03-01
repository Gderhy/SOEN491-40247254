/**
 * Routes Index
 * Combines all route modules and exports a single router setup function
 */

import type { Express } from 'express';
import healthRoutes from './healthRoutes.js';
import apiRoutes from './apiRoutes.js';
import authRoutes from './authRoutes.js';

/**
 * Setup all application routes
 * @param app Express application instance
 */
export function setupRoutes(app: Express): void {
  // API info routes
  app.use('/', apiRoutes);
  
  // Health check routes
  app.use('/health', healthRoutes);
  
  // Authentication routes (includes /me and /auth/validate)
  app.use('/', authRoutes);
  
  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      availableEndpoints: {
        'GET /': 'API information',
        'GET /health': 'Basic health check',
        'GET /health/detailed': 'Detailed health check',
        'GET /me': 'Current user info (requires auth)',
        'GET /auth/validate': 'Validate JWT token (requires auth)'
      }
    });
  });
}

// Named exports for individual route modules (if needed)
export { healthRoutes, apiRoutes, authRoutes };
