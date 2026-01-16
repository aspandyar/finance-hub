import type { RecurringTransaction } from '../services/recurringTransactionApi'
import type { Transaction } from '../services/transactionApi'

/**
 * Generate recurring transaction instances for a given date range
 * @param recurringTransaction - The recurring transaction
 * @param fromDate - Start date of the range (optional)
 * @param toDate - End date of the range (optional)
 * @returns Array of transaction-like objects representing recurring instances
 */
export const generateRecurringInstances = (
  recurringTransaction: RecurringTransaction,
  fromDate?: string | null,
  toDate?: string | null
): Array<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>> => {
  if (!recurringTransaction.isActive) {
    return []
  }

  const instances: Array<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>> = []
  const startDate = new Date(recurringTransaction.startDate)
  const endDate = recurringTransaction.endDate ? new Date(recurringTransaction.endDate) : null
  
  // Determine the date range to generate instances for
  const rangeStart = fromDate ? new Date(fromDate) : startDate
  const rangeEnd = toDate ? new Date(toDate) : (endDate || new Date())
  
  // Set times to start of day for accurate comparison
  rangeStart.setHours(0, 0, 0, 0)
  rangeEnd.setHours(23, 59, 59, 999)
  startDate.setHours(0, 0, 0, 0)
  if (endDate) endDate.setHours(23, 59, 59, 999)

  // If recurring transaction hasn't started yet, return empty
  if (startDate > rangeEnd) {
    return []
  }

  // If recurring transaction has ended, check if end date is before range start
  if (endDate && endDate < rangeStart) {
    return []
  }

  // Calculate the effective start date (max of transaction start and range start)
  const effectiveStart = startDate > rangeStart ? startDate : rangeStart
  
  // Calculate the effective end date (min of transaction end and range end)
  const effectiveEnd = endDate && endDate < rangeEnd ? endDate : rangeEnd

  // Generate instances based on frequency
  let currentDate = new Date(effectiveStart)

  while (currentDate <= effectiveEnd) {
    // Check if this date falls within the range
    if (currentDate >= rangeStart && currentDate <= rangeEnd) {
      instances.push({
        userId: recurringTransaction.userId,
        categoryId: recurringTransaction.categoryId,
        amount: recurringTransaction.amount,
        type: recurringTransaction.type,
        description: recurringTransaction.description,
        date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
      })
    }

    // Move to next occurrence based on frequency
    switch (recurringTransaction.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
    }

    // Safety check to prevent infinite loops
    if (instances.length > 10000) {
      console.warn('Too many recurring instances generated, stopping')
      break
    }
  }

  return instances
}

/**
 * Convert recurring transactions to transaction-like format for a date range
 * @param recurringTransactions - Array of recurring transactions
 * @param fromDate - Start date of the range (optional)
 * @param toDate - End date of the range (optional)
 * @returns Array of transaction-like objects
 */
export const convertRecurringToTransactions = (
  recurringTransactions: RecurringTransaction[],
  fromDate?: string | null,
  toDate?: string | null
): Transaction[] => {
  const allInstances: Transaction[] = []

  recurringTransactions.forEach(rt => {
    const instances = generateRecurringInstances(rt, fromDate, toDate)
    // Convert to Transaction format with generated IDs
    instances.forEach((instance, index) => {
      allInstances.push({
        ...instance,
        id: `recurring-${rt.id}-${index}`, // Generate unique ID
        createdAt: rt.createdAt,
        updatedAt: rt.createdAt,
      } as Transaction)
    })
  })

  return allInstances
}
