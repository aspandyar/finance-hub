// Central export point for all API services
export * from './apiClient';
export * from './categoryApi';
export * from './transactionApi';
export * from './budgetApi';
export * from './recurringTransactionApi';
export * from './userApi';

// Re-export for convenience
import { categoryApi } from './categoryApi';
import { transactionApi } from './transactionApi';
import { budgetApi } from './budgetApi';
import { recurringTransactionApi } from './recurringTransactionApi';
import { userApi } from './userApi';

export default {
  category: categoryApi,
  transaction: transactionApi,
  budget: budgetApi,
  recurringTransaction: recurringTransactionApi,
  user: userApi,
};

