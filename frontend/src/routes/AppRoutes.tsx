import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, ApiTest } from '@components/index';
import { Home, Login, Register, Dashboard } from '@pages/index';
import { ROUTES } from './routeConfig';

/**
 * AppRoutes component
 * Centralized route definitions for the application
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.API_TEST} element={<ApiTest />} />
      
      {/* Protected routes */}
      <Route 
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback route - redirect unknown paths to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

// Default export for backward compatibility
export default AppRoutes;
