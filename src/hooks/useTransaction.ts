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
  startDate: string
  endDate: string | null
}

interface UseTransactionResult {
  isSubmitting: boolean
  error: string | null
  createTransaction: (params: CreateTransactionParams) => Promise<void>
  createRecurringTransaction: (params: CreateRecurringTransactionParams) => Promise<void>
  clearError: () => void
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

      console.log('Creating transaction:', {
        categoryId: params.categoryId,
        amount: params.amount,
        type: transactionType,
        description: params.description,
        date: params.date,
      })
      
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
      
      await recurringTransactionApi.create({
        categoryId: params.categoryId,
        amount: params.amount,
        type: transactionType,
        description: params.description,
        frequency: params.frequency,
        startDate: params.startDate,
        endDate: params.endDate,
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

