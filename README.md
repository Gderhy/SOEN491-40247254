# SOEN491-40247254

**Asset Tracker Application**  
Gabriel Derhy

## Project Structure

This is a monorepo containing:
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express + TypeScript
- **Database/Auth**: Supabase

```
/frontend   - React frontend application
/backend    - Express API server with TypeScript
README.md   - This file
```

## Environment Setup

### 🔐 Environment Variables Configuration

Both frontend and backend require environment variables for Supabase integration.

**Backend Environment Variables:**
```bash
cd backend
copy .env.example .env
# Edit .env with your actual Supabase credentials
```

**Frontend Environment Variables:**
```bash
cd frontend  
copy .env.example .env
# Edit .env with your actual Supabase credentials
```

### 📋 Required Environment Variables

**Backend (.env):**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)

**Frontend (.env):**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:4000)

> ⚠️ **Important**: Never commit `.env` files to version control. Only `.env.example` files are tracked.

## Setup Instructions

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy and configure environment variables:
   ```bash
   copy .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

The frontend will be available at: **http://localhost:5173**

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy and configure environment variables:
   ```bash
   copy .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   Or build and run production version:
   ```bash
   npm run build
   npm start
   ```

The backend will be available at: **http://localhost:4000**

## Development

### Ports Used
- **Frontend**: 5173 (Vite default)
- **Backend**: 4000 (configurable via PORT environment variable)

### API Endpoints
- `GET /health` - Returns `{ "ok": true }` for health checks
- `GET /health/detailed` - Detailed health check including Supabase connection
- `GET /` - Basic API info

### Environment Validation

Both applications validate required environment variables on startup:
- **Missing variables** → Application throws an error with clear instructions
- **Invalid Supabase credentials** → Health checks will show connection status
- **Runtime validation** → Applications won't start without proper configuration

### Quick Start (Both Services)

Open two terminal windows:

**Terminal 1 (Backend)**:
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 for the frontend and http://localhost:4000/health for backend health check.
