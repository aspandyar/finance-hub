import { useState, useEffect } from 'react'
import { transactionApi, type Transaction } from '../services/transactionApi'
import { categoryApi, type Category } from '../services/categoryApi'
import {
  transformTransactionsToChartData,
  transformTransactionsToCategoryData,
} from '../utils/transactionHelpers'

interface ChartData {
  expensesData: { date: string; value: number }[]
  incomeData: { date: string; value: number }[]
  expenseCategories: Category[]
  incomeCategories: Category[]
  expenseCategoryData: Array<{ name: string; value: number; color: string }>
  incomeCategoryData: Array<{ name: string; value: number; color: string }>
  expenseColor: string
  incomeColor: string
  isLoadingCategories: boolean
  isLoadingTransactions: boolean
  error: Error | null
}

/**
 * Custom hook for fetching and transforming chart data
 */
export const useChartData = (userId: string | undefined): ChartData => {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([])
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [expenseColor, setExpenseColor] = useState('#ef4444')
  const [incomeColor, setIncomeColor] = useState('#10b981')

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId) return

      setIsLoadingCategories(true)
      setError(null)
      try {
        const allCategories = await categoryApi.getByUserId(userId)

        // Filter by type
        const expenseCats = allCategories.filter(cat => cat.type === 'expense')
        const incomeCats = allCategories.filter(cat => cat.type === 'income')

        setExpenseCategories(expenseCats)
        setIncomeCategories(incomeCats)

        // Use first category color for chart colors
        if (expenseCats.length > 0) {
          setExpenseColor(expenseCats[0]?.color || '#ef4444')
        }
        if (incomeCats.length > 0) {
          setIncomeColor(incomeCats[0]?.color || '#10b981')
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'))
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [userId])

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return

      setIsLoadingTransactions(true)
      setError(null)
      try {
        const fetchedTransactions = await transactionApi.getByUserId(userId)
        setTransactions(fetchedTransactions)
      } catch (err) {
        console.error('Failed to fetch transactions:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch transactions'))
      } finally {
        setIsLoadingTransactions(false)
      }
    }

    fetchTransactions()
  }, [userId])

  // Transform data for charts
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const incomeTransactions = transactions.filter(t => t.type === 'income')

  const expensesData = transformTransactionsToChartData(expenseTransactions)
  const incomeData = transformTransactionsToChartData(incomeTransactions)

  const expenseCategoryData = transformTransactionsToCategoryData(
    expenseTransactions,
    expenseCategories.map(cat => ({ id: cat.id, name: cat.name, color: cat.color }))
  ).slice(0, 5) // Top 5 categories

  const incomeCategoryData = transformTransactionsToCategoryData(
    incomeTransactions,
    incomeCategories.map(cat => ({ id: cat.id, name: cat.name, color: cat.color }))
  ).slice(0, 5) // Top 5 categories

  return {
    expensesData,
    incomeData,
    expenseCategories,
    incomeCategories,
    expenseCategoryData,
    incomeCategoryData,
    expenseColor,
    incomeColor,
    isLoadingCategories,
    isLoadingTransactions,
    error,
  }
}

