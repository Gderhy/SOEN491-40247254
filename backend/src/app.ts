import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
// Type augmentation is automatically loaded by TypeScript

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: false
}));

app.use(express.json());

// Setup all routes
setupRoutes(app);

// Global error handler (MUST be last middleware)
app.use(errorHandler);

export default app;

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`📍 Health check available at: http://localhost:${config.port}/health`);
  console.log(`📍 Detailed health check: http://localhost:${config.port}/health/detailed`);
  console.log(`📍 API info available at: http://localhost:${config.port}/`);
});
