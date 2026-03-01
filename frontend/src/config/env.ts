/**
 * Validates that all required environment variables are present
 * Throws an error if any required variables are missing
 */
export function validateEnvironment() {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY'
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please copy .env.example to .env and fill in the required values.`
    );
  }
}

/**
 * Typed environment configuration for frontend
 */
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

// Validate environment on module load
validateEnvironment();
