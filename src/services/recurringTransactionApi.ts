// Recurring Transaction API service
import { apiRequest } from './apiClient';
import { convertDatesToYYYYMMDD } from '../utils/dateHelpers';

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
  startDate: string | Date;
  endDate?: string | Date | null;
  nextOccurrence?: string | Date;
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

export type EditScope = 'single' | 'future' | 'all';
export type DeleteScope = 'single' | 'future' | 'all';

export interface UpdateRecurringTransactionWithScopeInput extends UpdateRecurringTransactionInput {
  scope: EditScope;
  effectiveDate: string; // YYYY-MM-DD format
}

export interface DeleteRecurringTransactionWithScopeInput {
  scope: DeleteScope;
  effectiveDate: string; // YYYY-MM-DD format
}

export interface UpdateRecurringTransactionResponse {
  message: string;
  recurringTransaction: RecurringTransaction;
  newRecurringTransaction?: RecurringTransaction;
  effectiveDate?: string;
  original?: RecurringTransaction;
  new?: RecurringTransaction;
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
    // Convert Date objects to YYYY-MM-DD format for API
    const apiData = convertDatesToYYYYMMDD(data, ['startDate', 'endDate', 'nextOccurrence']);

    return apiRequest<RecurringTransaction>('/api/recurring-transactions', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  },

  // Update recurring transaction (legacy - without scope)
  update: async (
    id: string,
    data: UpdateRecurringTransactionInput
  ): Promise<RecurringTransaction> => {
    return apiRequest<RecurringTransaction>(`/api/recurring-transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update recurring transaction with scope
  updateWithScope: async (
    id: string,
    data: UpdateRecurringTransactionWithScopeInput
  ): Promise<UpdateRecurringTransactionResponse> => {
    return apiRequest<UpdateRecurringTransactionResponse>(`/api/recurring-transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete recurring transaction (legacy - without scope)
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/api/recurring-transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Delete recurring transaction with scope
  deleteWithScope: async (
    id: string,
    data: DeleteRecurringTransactionWithScopeInput
  ): Promise<void> => {
    return apiRequest<void>(`/api/recurring-transactions/${id}`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },
};

