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
  console.log('Setting up routes...');
  
  try {
    // API info routes (must be last for root path)
    app.use('/health', healthRoutes);
    console.log('✓ Health routes loaded');
    
    // Authentication routes 
    app.use('/', authRoutes);
    console.log('✓ Auth routes loaded');
    
    // API info route (root path)
    app.use('/', apiRoutes);
    console.log('✓ API routes loaded');
    
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
    
    console.log('✓ All routes setup complete');
  } catch (error) {
    console.error('Error setting up routes:', error);
    throw error;
  }
}
