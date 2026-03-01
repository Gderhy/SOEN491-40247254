# SOEN491-40247254

**Asset Tracker Application**  
Gabriel Derhy

## Project Structure

This is a monorepo containing:
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express + TypeScript
- **Database/Auth**: Supabase (to be added later)

```
/frontend   - React frontend application
/backend    - Express API server
README.md   - This file
```

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

3. Start development server:
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

3. Start the development server:
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
- `GET /` - Basic API info

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
