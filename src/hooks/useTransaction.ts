import { useState } from 'react'
import { transactionApi } from '../services/transactionApi'
import { recurringTransactionApi } from '../services/recurringTransactionApi'
import { TransactionType, FrequencyType } from '../constants'

export interface CreateTransactionParams {
  categoryId: string
  amount: number
  type: TransactionType
  description: string | null
  date: string
}

export interface CreateRecurringTransactionParams {
  categoryId: string
  amount: number
  type: TransactionType
  description: string | null
  frequency: FrequencyType
  startDate: string | Date
  endDate: string | Date | null
}

interface UseTransactionResult {
  isSubmitting: boolean
  error: string | null
  createTransaction: (params: CreateTransactionParams) => Promise<void>
  createRecurringTransaction: (params: CreateRecurringTransactionParams) => Promise<void>
  clearError: () => void
}

/**
 * Calculate the next occurrence date based on frequency
 */
function calculateNextOccurrence(startDate: Date, frequency: FrequencyType): Date {
  const date = new Date(startDate)

  switch (frequency) {
    case FrequencyType.DAILY:
      date.setDate(date.getDate() + 1)
      break
    case FrequencyType.WEEKLY:
      date.setDate(date.getDate() + 7)
      break
    case FrequencyType.MONTHLY:
      date.setMonth(date.getMonth() + 1)
      break
    case FrequencyType.YEARLY:
      date.setFullYear(date.getFullYear() + 1)
      break
  }

  return date
}

/**
 * Custom hook for creating transactions
 */
export const useTransaction = (): UseTransactionResult => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTransaction = async (params: CreateTransactionParams): Promise<void> => {
    setIsSubmitting(true)
    setError(null)

    try {
      const transactionType = params.type === TransactionType.INCOME ? 'income' : 'expense'
      
      await transactionApi.create({
        categoryId: params.categoryId,
        amount: params.amount,
        type: transactionType,
        description: params.description,
        date: params.date,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const createRecurringTransaction = async (params: CreateRecurringTransactionParams): Promise<void> => {
    setIsSubmitting(true)
    setError(null)

    try {
      const transactionType = params.type === TransactionType.INCOME ? 'income' : 'expense'
      
      // Convert startDate to Date object if it's a string
      const startDate = params.startDate instanceof Date 
        ? params.startDate 
        : new Date(params.startDate)
      
      // Convert endDate to Date object if it's a string and not null
      const endDate = params.endDate 
        ? (params.endDate instanceof Date ? params.endDate : new Date(params.endDate))
        : null
      
      // Calculate next occurrence
      const nextOccurrence = calculateNextOccurrence(startDate, params.frequency)
      
      await recurringTransactionApi.create({
        categoryId: params.categoryId,
        amount: params.amount,
        type: transactionType,
        description: params.description,
        frequency: params.frequency,
        startDate: startDate,
        endDate: endDate,
        nextOccurrence: nextOccurrence,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create recurring transaction')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    isSubmitting,
    error,
    createTransaction,
    createRecurringTransaction,
    clearError,
  }
}

