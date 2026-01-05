// Environment configuration
// All environment variables should be prefixed with VITE_ to be accessible in the browser

export const config = {
  // API Configuration
  api: {
    // Full API URL (e.g., http://localhost:3000 or https://api.example.com)
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    
    // API host (e.g., localhost or api.example.com)
    host: import.meta.env.VITE_API_HOST || 'localhost',
    
    // API port (backend default: 3000)
    port: Number(import.meta.env.VITE_API_PORT) || 3000,
    
    // API protocol (http or https)
    protocol: import.meta.env.VITE_API_PROTOCOL || 'http',
    
    // API timeout in milliseconds
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
  
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

// Helper function to build API URL from components
export const getApiUrl = (): string => {
  // If VITE_API_BASE_URL is explicitly set, use it (takes priority)
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl && envBaseUrl.trim() !== '') {
    return envBaseUrl.trim();
  }
  
  // Otherwise, build URL from separate components
  const protocol = config.api.protocol;
  const host = config.api.host;
  const port = config.api.port;
  
  // Don't include port for standard ports (80 for http, 443 for https)
  if ((protocol === 'http' && port === 80) || (protocol === 'https' && port === 443)) {
    return `${protocol}://${host}`;
  }
  
  return `${protocol}://${host}:${port}`;
};

export default config;

