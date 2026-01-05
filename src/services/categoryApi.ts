// Category API service
import { apiRequest } from './apiClient';

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string | null;
  isSystem: boolean;
  createdAt: string;
}

export const categoryApi = {
  // Get all categories (optionally filtered by type)
  getAll: async (type?: 'income' | 'expense'): Promise<Category[]> => {
    const queryParams = type ? `?type=${type}` : '';
    return apiRequest<Category[]>(`/api/categories${queryParams}`);
  },

  // Get categories by user ID
  getByUserId: async (userId: string): Promise<Category[]> => {
    return apiRequest<Category[]>(`/api/categories/user/${userId}`);
  },

  // Get category by ID
  getById: async (id: string): Promise<Category> => {
    return apiRequest<Category>(`/api/categories/${id}`);
  },

  // Create category
  create: async (data: {
    name: string;
    type: 'income' | 'expense';
    color?: string;
    icon?: string | null;
  }): Promise<Category> => {
    return apiRequest<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update category
  update: async (
    id: string,
    data: {
      name?: string;
      type?: 'income' | 'expense';
      color?: string;
      icon?: string | null;
    }
  ): Promise<Category> => {
    return apiRequest<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

