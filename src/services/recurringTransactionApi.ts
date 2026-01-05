// Recurring Transaction API service
import { apiRequest } from './apiClient';

export interface RecurringTransaction {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  type: 'income' | 'expense';
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string | null;
  nextOccurrence: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateRecurringTransactionInput {
  categoryId: string;
  amount: number | string;
  type: 'income' | 'expense';
  description?: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string | null;
}

export interface UpdateRecurringTransactionInput {
  categoryId?: string;
  amount?: number | string;
  type?: 'income' | 'expense';
  description?: string | null;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
}

export const recurringTransactionApi = {
  // Get all recurring transactions
  getAll: async (): Promise<RecurringTransaction[]> => {
    return apiRequest<RecurringTransaction[]>('/api/recurring-transactions');
  },

  // Get recurring transactions by user ID
  getByUserId: async (userId: string): Promise<RecurringTransaction[]> => {
    return apiRequest<RecurringTransaction[]>(`/api/recurring-transactions/user/${userId}`);
  },

  // Get recurring transaction by ID
  getById: async (id: string): Promise<RecurringTransaction> => {
    return apiRequest<RecurringTransaction>(`/api/recurring-transactions/${id}`);
  },

  // Create recurring transaction
  create: async (data: CreateRecurringTransactionInput): Promise<RecurringTransaction> => {
    return apiRequest<RecurringTransaction>('/api/recurring-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update recurring transaction
  update: async (
    id: string,
    data: UpdateRecurringTransactionInput
  ): Promise<RecurringTransaction> => {
    return apiRequest<RecurringTransaction>(`/api/recurring-transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete recurring transaction
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/api/recurring-transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

