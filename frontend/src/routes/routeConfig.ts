/**
 * Route path constants
 * Centralized route definitions to avoid magic strings
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  HOLDINGS: '/holdings',
  TRANSACTIONS: '/transactions',
  ACCOUNTS: '/accounts',
  API_TEST: '/api-test',
} as const;

/**
 * Route configuration with metadata
 */
export interface RouteConfig {
  path: string;
  name: string;
  protected: boolean;
  description: string;
}

export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  HOME: {
    path: ROUTES.HOME,
    name: 'Home',
    protected: false,
    description: 'Landing page with authentication options'
  },
  LOGIN: {
    path: ROUTES.LOGIN,
    name: 'Login',
    protected: false,
    description: 'User authentication page'
  },
  REGISTER: {
    path: ROUTES.REGISTER,
    name: 'Register',
    protected: false,
    description: 'User registration page'
  },
  DASHBOARD: {
    path: ROUTES.DASHBOARD,
    name: 'Dashboard',
    protected: true,
    description: 'Main application dashboard'
  },
  HOLDINGS: {
    path: ROUTES.HOLDINGS,
    name: 'Holdings',
    protected: true,
    description: 'Portfolio holdings derived from transaction history'
  },
  TRANSACTIONS: {
    path: ROUTES.TRANSACTIONS,
    name: 'Transactions',
    protected: true,
    description: 'Transaction history and portfolio tracking'
  },
} as const;

/**
 * Helper function to get route by key
 */
export function getRoute(key: keyof typeof ROUTES): string {
  return ROUTES[key];
}

/**
 * Helper function to check if route is protected
 */
export function isProtectedRoute(path: string): boolean {
  const config = Object.values(ROUTE_CONFIG).find(route => route.path === path);
  return config?.protected ?? false;
}
