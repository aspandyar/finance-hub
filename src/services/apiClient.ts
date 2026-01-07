// Base API client with shared functionality
import { getApiUrl, config } from '../config/env';

// Get API URL - returns empty string when proxy is enabled (for relative URLs)
const getApiBaseUrl = () => {
  return getApiUrl();
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
  
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${apiBaseUrl}${normalizedEndpoint}`;
  
  // Validate URL format only for absolute URLs
  if (apiBaseUrl) {
    try {
      new URL(fullUrl);
    } catch (urlError) {
      throw new Error(`Invalid API URL: ${fullUrl}. Please check your VITE_API_BASE_URL configuration.`);
    }
  }
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          errorData = { error: text || `HTTP ${response.status}: ${response.statusText}` };
        }
      } catch (parseError) {
        errorData = { 
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: 'Failed to parse error response'
        };
      }

      const errorMessage = errorData?.error || errorData?.message || `HTTP error! status: ${response.status}`;
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    return response.json();
  } catch (error: any) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(error?.message || 'Network error: Failed to connect to server');
  }
};

