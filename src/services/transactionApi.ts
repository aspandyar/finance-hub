// Transaction API service
import { apiRequest } from './apiClient';

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  type: 'income' | 'expense';
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  categoryId: string;
  amount: number | string;
  type: 'income' | 'expense';
  description?: string | null;
  date: string;
}

export interface UpdateTransactionInput {
  categoryId?: string;
  amount?: number | string;
  type?: 'income' | 'expense';
  description?: string | null;
  date?: string;
}

export const transactionApi = {
  // Get all transactions
  getAll: async (): Promise<Transaction[]> => {
    return apiRequest<Transaction[]>('/api/transactions');
  },

  // Get transactions by user ID
  getByUserId: async (userId: string): Promise<Transaction[]> => {
    return apiRequest<Transaction[]>(`/api/transactions/user/${userId}`);
  },

  // Get transaction by ID
  getById: async (id: string): Promise<Transaction> => {
    return apiRequest<Transaction>(`/api/transactions/${id}`);
  },

  // Create transaction
  create: async (data: CreateTransactionInput): Promise<Transaction> => {
    return apiRequest<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update transaction
  update: async (
    id: string,
    data: UpdateTransactionInput
  ): Promise<Transaction> => {
    return apiRequest<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete transaction
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

