// Base API client with shared functionality
import { getApiUrl, config } from '../config/env';

// Get API URL - use relative URLs in dev (proxy handles it) or absolute in production
const getApiBaseUrl = () => {
  // In development, use relative URLs (Vite proxy will forward to backend)
  // In production, use absolute URL
  if (import.meta.env.DEV && import.meta.env.VITE_USE_PROXY !== 'false') {
    return ''; // Empty string means relative URL
  }
  
  const url = getApiUrl();
  // Debug log (remove in production)
  if (import.meta.env.DEV) {
    console.log('[API Client] Base URL:', url || '(relative - using proxy)');
  }
  return url;
};

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem(config.auth.tokenKey);
};

// API request helper
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  // Create headers object properly to avoid TypeScript errors
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add custom headers from options
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const apiBaseUrl = getApiBaseUrl();
  const fullUrl = `${apiBaseUrl}${endpoint}`;
  
  // Debug log (remove in production)
  if (import.meta.env.DEV) {
    console.log('[API Client] Request:', fullUrl);
  }
  
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

