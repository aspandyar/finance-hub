import { useState, useEffect } from 'react'
import { transactionApi, type Transaction } from '../services/transactionApi'
import { categoryApi, type Category } from '../services/categoryApi'
import { calculateDashboardMetrics, calculateBalanceHistory } from '../utils/transactionHelpers'
import { formatCurrency, formatShortDate } from '../utils/formatters'

interface LastPayment {
  amount: string
  date: string
  description: string | null
  categoryName: string
}

interface DashboardMetrics {
  balance: string
  totalIncome: string
  totalExpenses: string
  savings: string
  avgExpense: string
  balanceHistory: number[]
  lastIncomePayments: LastPayment[]
  lastExpensePayments: LastPayment[]
  isLoading: boolean
  error: Error | null
}

/**
 * Custom hook for fetching and calculating dashboard metrics
 */
export const useDashboardData = (userId: string | undefined, currency: string = 'USD'): DashboardMetrics => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId) return

      try {
        const fetchedCategories = await categoryApi.getByUserId(userId)
        setCategories(fetchedCategories)
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }

    fetchCategories()
  }, [userId])

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return

      setIsLoading(true)
      setError(null)
      try {
        const fetchedTransactions = await transactionApi.getByUserId(userId)
        setTransactions(fetchedTransactions)
      } catch (err) {
        console.error('Failed to fetch transactions:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch transactions'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [userId])

  // Calculate metrics
  const metrics = calculateDashboardMetrics(transactions)
  const balanceHistory = calculateBalanceHistory(transactions, 12)

  // Create category map for quick lookup
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]))

  // Get last 3 income payments
  const lastIncomePayments = transactions
    .filter(t => t.type === 'income')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(t => ({
      amount: formatCurrency(parseFloat(t.amount), currency),
      date: formatShortDate(t.date),
      description: t.description,
      categoryName: categoryMap.get(t.categoryId) || 'Income',
    }))

  // Get last 3 expense payments
  const lastExpensePayments = transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(t => ({
      amount: formatCurrency(parseFloat(t.amount), currency),
      date: formatShortDate(t.date),
      description: t.description,
      categoryName: categoryMap.get(t.categoryId) || 'Expense',
    }))

  return {
    balance: formatCurrency(metrics.balance, currency),
    totalIncome: formatCurrency(metrics.totalIncome, currency),
    totalExpenses: formatCurrency(metrics.totalExpenses, currency),
    savings: formatCurrency(metrics.savings, currency),
    avgExpense: formatCurrency(metrics.avgExpense, currency),
    balanceHistory,
    lastIncomePayments,
    lastExpensePayments,
    isLoading,
    error,
  }
}

