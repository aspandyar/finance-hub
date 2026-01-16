// Central export point for all API services
export * from './apiClient';
export * from './authApi';
export * from './categoryApi';
export * from './transactionApi';
export * from './budgetApi';
export * from './recurringTransactionApi';
// Export User type from authApi (userApi also exports User, but we use authApi's version)
export type { User } from './authApi';
// Export everything from userApi except User to avoid duplicate export
export type { UpdateUserInput } from './userApi';
export { userApi } from './userApi';

// Re-export for convenience
import { authApi } from './authApi';
import { categoryApi } from './categoryApi';
import { transactionApi } from './transactionApi';
import { budgetApi } from './budgetApi';
import { recurringTransactionApi } from './recurringTransactionApi';
import { userApi } from './userApi';

export default {
  auth: authApi,
  category: categoryApi,
  transaction: transactionApi,
  budget: budgetApi,
  recurringTransaction: recurringTransactionApi,
  user: userApi,
};

