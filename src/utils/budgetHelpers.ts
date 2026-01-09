/**
 * Utility functions for budget calculations
 */

import type { RecurringTransaction } from '../services/recurringTransactionApi'

/**
 * Calculate monthly budget amount from a recurring transaction
 * @param recurringTransaction - The recurring transaction
 * @returns Monthly budget amount
 */
export const calculateMonthlyBudget = (recurringTransaction: RecurringTransaction): number => {
  const amount = parseFloat(recurringTransaction.amount)
  
  switch (recurringTransaction.frequency) {
    case 'daily':
      return amount * 30 // Approximate 30 days per month
    case 'weekly':
      return amount * 4 // Approximate 4 weeks per month
    case 'monthly':
      return amount
    case 'yearly':
      return amount / 12 // Divide by 12 months
    default:
      return amount
  }
}

/**
 * Get the first day of a month in YYYY-MM-DD format
 * @param date - Date string or Date object
 * @returns First day of the month in YYYY-MM-DD format
 */
export const getFirstDayOfMonth = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}
