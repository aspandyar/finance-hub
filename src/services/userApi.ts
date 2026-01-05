// User API service
import { apiRequest } from './apiClient';

export interface User {
  id: string;
  email: string;
  fullName: string;
  currency: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserInput {
  fullName?: string;
  currency?: string;
}

export const userApi = {
  // Get current user
  getCurrent: async (): Promise<User> => {
    return apiRequest<User>('/api/users/me');
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    return apiRequest<User>(`/api/users/${id}`);
  },

  // Get all users (admin/manager only)
  getAll: async (): Promise<User[]> => {
    return apiRequest<User[]>('/api/users');
  },

  // Update current user
  updateCurrent: async (data: UpdateUserInput): Promise<User> => {
    return apiRequest<User>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update user by ID (admin/manager only)
  update: async (id: string, data: UpdateUserInput): Promise<User> => {
    return apiRequest<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

