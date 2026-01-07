import { useState, useEffect } from 'react'
import { transactionApi, type Transaction } from '../services/transactionApi'
import { calculateDashboardMetrics, calculateBalanceHistory } from '../utils/transactionHelpers'
import { formatCurrency } from '../utils/formatters'

interface DashboardMetrics {
  balance: string
  totalIncome: string
  totalExpenses: string
  savings: string
  avgExpense: string
  balanceHistory: number[]
  isLoading: boolean
  error: Error | null
}

/**
 * Custom hook for fetching and calculating dashboard metrics
 */
export const useDashboardData = (userId: string | undefined, currency: string = 'USD'): DashboardMetrics => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

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

  return {
    balance: formatCurrency(metrics.balance, currency),
    totalIncome: formatCurrency(metrics.totalIncome, currency),
    totalExpenses: formatCurrency(metrics.totalExpenses, currency),
    savings: formatCurrency(metrics.savings, currency),
    avgExpense: formatCurrency(metrics.avgExpense, currency),
    balanceHistory,
    isLoading,
    error,
  }
}

