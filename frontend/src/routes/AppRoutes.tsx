import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute, ApiTest } from '@components/index';
import { Home, Login, Register, Dashboard, HoldingsPage, TransactionsPage, AccountsPage } from '@pages/index';
import { AppShell } from '@layouts/index';
import { ROUTES } from './routeConfig';

/**
 * Wraps the AppShell layout around the <Outlet> for the layout-route pattern.
 * Protected check is handled by ProtectedRoute, AppShell just provides the chrome.
 */
function AppShellLayout() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  );
}

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

      {/* Protected routes – all share the AppShell layout */}
      <Route element={<AppShellLayout />}>
        <Route path={ROUTES.DASHBOARD}    element={<Dashboard />} />
        <Route path={ROUTES.HOLDINGS}     element={<HoldingsPage />} />
        <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
        <Route path={ROUTES.ACCOUNTS}     element={<AccountsPage />} />
      </Route>

      {/* Fallback route - redirect unknown paths to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

// Default export for backward compatibility
export default AppRoutes;
