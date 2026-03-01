const express = require('express');
const app = express();

// Get port from environment variable or default to 4000
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Asset Tracker Backend API',
    status: 'running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});
