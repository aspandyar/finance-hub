// Budget API service
import { apiRequest } from './apiClient';

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetInput {
  categoryId: string;
  amount: number | string;
  month: string;
}

export interface UpdateBudgetInput {
  categoryId?: string;
  amount?: number | string;
  month?: string;
}

export const budgetApi = {
  // Get all budgets
  getAll: async (): Promise<Budget[]> => {
    return apiRequest<Budget[]>('/api/budgets');
  },

  // Get budgets by user ID
  getByUserId: async (userId: string): Promise<Budget[]> => {
    return apiRequest<Budget[]>(`/api/budgets/user/${userId}`);
  },

  // Get budget by ID
  getById: async (id: string): Promise<Budget> => {
    return apiRequest<Budget>(`/api/budgets/${id}`);
  },

  // Create budget
  create: async (data: CreateBudgetInput): Promise<Budget> => {
    return apiRequest<Budget>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update budget
  update: async (
    id: string,
    data: UpdateBudgetInput
  ): Promise<Budget> => {
    return apiRequest<Budget>(`/api/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete budget
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
  },

  // Get budgets by user ID and month
  getByUserIdAndMonth: async (userId: string, month: string): Promise<Budget[]> => {
    return apiRequest<Budget[]>(`/api/budgets/user/${userId}/month/${month}`);
  },
};

