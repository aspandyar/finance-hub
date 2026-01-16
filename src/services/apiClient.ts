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

    // Handle empty responses (e.g., DELETE operations with 204 No Content)
    const contentLength = response.headers.get('content-length');
    
    // If content-length is 0 or response is 204 No Content, return empty result
    if (response.status === 204 || contentLength === '0') {
      return undefined as T;
    }
    
    // Check if there's actually content to parse
    const text = await response.text();
    
    // If response is empty, return undefined
    if (!text || text.trim() === '') {
      return undefined as T;
    }
    
    // Try to parse as JSON
    try {
      const responseData = JSON.parse(text);
      return responseData as T;
    } catch (parseError) {
      // If it's not valid JSON but we got here, it might be plain text
      // Return the text as the result (for void types, this will be undefined)
      return (text || undefined) as T;
    }
  } catch (error: any) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(error?.message || 'Network error: Failed to connect to server');
  }
};

