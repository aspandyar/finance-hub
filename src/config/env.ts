// Environment configuration
// All environment variables should be prefixed with VITE_ to be accessible in the browser

export const config = {
  // App Configuration
  app: {
    // Environment (development, production, etc.)
    env: import.meta.env.MODE || 'development',
    
    // App name
    name: import.meta.env.VITE_APP_NAME || 'Finance Hub',
    
    // App version
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  
  // Authentication Configuration
  auth: {
    // Token storage key in localStorage
    tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'authToken',
    
    // Token refresh interval (in milliseconds)
    refreshInterval: Number(import.meta.env.VITE_AUTH_REFRESH_INTERVAL) || 3600000, // 1 hour
  },
};

// Helper function to get API URL
export const getApiUrl = (): string => {
  // Dev: relative URL (Vite proxy)
  if (import.meta.env.DEV) {
    return '';
  }

  // Prod: must be explicitly set
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is required in production');
  }

  return baseUrl;
};

export default config;

