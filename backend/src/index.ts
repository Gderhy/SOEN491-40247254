import express from 'express';
import { config } from './config/env.js';
import { supabase } from './config/supabase.js';

const app = express();

// Middleware
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Enhanced health check with Supabase connection test
app.get('/health/detailed', async (req, res) => {
  try {
    // Test Supabase connection
    const { error } = await supabase.from('_test').select('*').limit(1);
    
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
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Asset Tracker Backend API',
    status: 'running',
    version: '1.0.0',
    environment: config.nodeEnv
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`📍 Health check available at: http://localhost:${config.port}/health`);
  console.log(`📍 Detailed health check: http://localhost:${config.port}/health/detailed`);
  console.log(`📍 API info available at: http://localhost:${config.port}/`);
});
