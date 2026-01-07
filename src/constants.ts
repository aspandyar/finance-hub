// Type definitions and enums from backend
// All actual data should be fetched from the API

// Enums from Prisma schema
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum FrequencyType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

// Default values (these match backend defaults)
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_CATEGORY_COLOR = '#6B7280';

