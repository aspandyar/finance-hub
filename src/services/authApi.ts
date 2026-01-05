// Authentication API service
import { apiRequest } from './apiClient';
import { config } from '../config/env';

export interface User {
  id: string;
  email: string;
  fullName: string;
  currency: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
  currency?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  // Register a new user
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Login user
  login: async (data: LoginInput): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Logout user
  logout: async (): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/api/auth/me');
  },
};

// Token management helpers
export const tokenStorage = {
  get: (): string | null => {
    return localStorage.getItem(config.auth.tokenKey);
  },

  set: (token: string): void => {
    localStorage.setItem(config.auth.tokenKey, token);
  },

  remove: (): void => {
    localStorage.removeItem(config.auth.tokenKey);
  },
};

