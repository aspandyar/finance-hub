import { useState } from 'react'
import { budgetApi } from '../services/budgetApi'
import { getFirstDayOfMonth } from '../utils/budgetHelpers'

interface UsePredictionResult {
  isCreating: boolean
  error: string | null
  createPrediction: (userId: string, categoryId: string, amount: number, targetMonth: string) => Promise<{ needsConfirmation: boolean; existingBudgetId?: string } | null>
  overwriteBudget: (budgetId: string, categoryId: string, amount: number, targetMonth: string) => Promise<void>
  clearError: () => void
}

/**
 * Custom hook for creating budget predictions
 */
export const usePrediction = (): UsePredictionResult => {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPrediction = async (
    userId: string,
    categoryId: string,
    amount: number,
    targetMonth: string
  ): Promise<{ needsConfirmation: boolean; existingBudgetId?: string } | null> => {
    setIsCreating(true)
    setError(null)

    try {
      // Get first day of target month
      const monthDate = getFirstDayOfMonth(targetMonth)
      
      // Check if budget already exists for this category and month
      const existingBudgets = await budgetApi.getByUserIdAndMonth(userId, monthDate)
      const existingBudget = existingBudgets.find(
        b => b.categoryId === categoryId
      )

      if (existingBudget) {
        setIsCreating(false)
        return {
          needsConfirmation: true,
          existingBudgetId: existingBudget.id,
        }
      }

      // Create new budget
      await budgetApi.create({
        categoryId,
        amount,
        month: monthDate,
      })

      setIsCreating(false)
      return { needsConfirmation: false }
    } catch (err: any) {
      setError(err.message || 'Failed to create prediction')
      setIsCreating(false)
      throw err
    }
  }

  const overwriteBudget = async (
    budgetId: string,
    categoryId: string,
    amount: number,
    targetMonth: string
  ): Promise<void> => {
    setIsCreating(true)
    setError(null)

    try {
      const monthDate = getFirstDayOfMonth(targetMonth)

      // Update existing budget (full rewrite)
      await budgetApi.update(budgetId, {
        categoryId,
        amount,
        month: monthDate,
      })

      setIsCreating(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update budget')
      setIsCreating(false)
      throw err
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    isCreating,
    error,
    createPrediction,
    overwriteBudget,
    clearError,
  }
}
