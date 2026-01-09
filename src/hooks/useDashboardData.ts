import { useState, useEffect, useMemo } from 'react'
import { transactionApi, type Transaction } from '../services/transactionApi'
import { recurringTransactionApi, type RecurringTransaction } from '../services/recurringTransactionApi'
import { categoryApi, type Category } from '../services/categoryApi'
import { budgetApi, type Budget } from '../services/budgetApi'
import { calculateDashboardMetrics, calculateBalanceHistory } from '../utils/transactionHelpers'
import { convertRecurringToTransactions } from '../utils/recurringTransactionHelpers'
import { formatCurrency, formatShortDate } from '../utils/formatters'
import { useDateFilter } from '../contexts/DateFilterContext'

interface LastPayment {
  amount: string
  date: string
  description: string | null
  categoryName: string
}

interface BudgetComparison {
  predictedIncome: number
  predictedExpenses: number
  predictedBalance: number
  actualIncome: number
  actualExpenses: number
  actualBalance: number
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
  budgetComparison: BudgetComparison | null
  recurringTransactions: RecurringTransaction[]
  categoryMap: Map<string, string>
  isLoading: boolean
  error: Error | null
}

/**
 * Custom hook for fetching and calculating dashboard metrics
 */
export const useDashboardData = (userId: string | undefined, currency: string = 'USD'): DashboardMetrics => {
  const { dateRange } = useDateFilter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
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

  // Fetch budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      if (!userId) return

      try {
        const fetchedBudgets = await budgetApi.getByUserId(userId)
        setBudgets(fetchedBudgets)
      } catch (err) {
        console.error('Failed to fetch budgets:', err)
      }
    }
    fetchBudgets()
  }, [userId])

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return

      setIsLoading(true)
      setError(null)
      try {
        const [fetchedTransactions, fetchedRecurringTransactions] = await Promise.all([
          transactionApi.getByUserId(userId),
          recurringTransactionApi.getByUserId(userId)
        ])
        setTransactions(fetchedTransactions)
        setRecurringTransactions(fetchedRecurringTransactions)
      } catch (err) {
        console.error('Failed to fetch transactions:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch transactions'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [userId])

  // Filter transactions by date range and convert recurring transactions
  const filteredTransactions = useMemo(() => {
    // Filter regular transactions by date range
    let filtered = transactions
    if (dateRange.from || dateRange.to) {
      filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        const fromDate = dateRange.from ? new Date(dateRange.from) : null
        const toDate = dateRange.to ? new Date(dateRange.to) : null

        // Set time to start of day for accurate comparison
        transactionDate.setHours(0, 0, 0, 0)
        if (fromDate) fromDate.setHours(0, 0, 0, 0)
        if (toDate) toDate.setHours(23, 59, 59, 999)

        if (fromDate && transactionDate < fromDate) return false
        if (toDate && transactionDate > toDate) return false

        return true
      })
    }

    // Convert recurring transactions to transaction instances for the date range
    const recurringInstances = convertRecurringToTransactions(
      recurringTransactions,
      dateRange.from,
      dateRange.to
    )

    // Combine regular transactions and recurring instances
    return [...filtered, ...recurringInstances]
  }, [transactions, recurringTransactions, dateRange])

  // Calculate metrics (now includes recurring transactions)
  const metrics = calculateDashboardMetrics(filteredTransactions)
  const balanceHistory = calculateBalanceHistory(filteredTransactions, 12)

  // Create category map for quick lookup
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]))
  const categoryTypeMap = new Map(categories.map(cat => [cat.id, cat.type]))

  // Calculate budget comparison (predicted vs actual)
  const calculateBudgetComparison = (): BudgetComparison | null => {
    if (!budgets.length || !categories.length) return null

    // Check if date filter is set
    const hasDateFilter = dateRange.from || dateRange.to

    let relevantBudgets: Budget[] = []
    let relevantTransactions = filteredTransactions

    if (hasDateFilter) {
      // Use date filter: find all months that overlap with the date range
      const fromDate = dateRange.from ? new Date(dateRange.from) : null
      const toDate = dateRange.to ? new Date(dateRange.to) : null

      if (fromDate) fromDate.setHours(0, 0, 0, 0)
      if (toDate) toDate.setHours(23, 59, 59, 999)

      // Get all months that fall within the date range
      const monthsInRange = new Set<string>()
      
      if (fromDate && toDate) {
        // Iterate through each month in the range
        const current = new Date(fromDate)
        while (current <= toDate) {
          const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
          monthsInRange.add(monthKey)
          
          // Move to next month
          current.setMonth(current.getMonth() + 1)
          current.setDate(1) // Reset to first day of month
        }
      } else if (fromDate) {
        // Only from date: include all months from that date onwards
        const current = new Date(fromDate)
        const endDate = new Date()
        while (current <= endDate) {
          const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
          monthsInRange.add(monthKey)
          current.setMonth(current.getMonth() + 1)
          current.setDate(1)
        }
      } else if (toDate) {
        // Only to date: include all months up to that date
        const current = new Date(2000, 0, 1) // Start from a reasonable early date
        while (current <= toDate) {
          const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
          monthsInRange.add(monthKey)
          current.setMonth(current.getMonth() + 1)
          current.setDate(1)
        }
      }

      // Filter budgets for months in range
      relevantBudgets = budgets.filter(b =>
        ((d) =>
          monthsInRange.has(
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          )
        )(new Date(b.month))
      )
      
      // Transactions are already filtered by filteredTransactions
    } else {
      // No date filter: fall back to current month
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      
      // Filter budgets for current month
      relevantBudgets = budgets.filter(b => b.month === currentMonth)
      
      // Filter transactions for current month
      relevantTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.date)
        const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`
        return transactionMonth === currentMonth
      })
    }

    // Calculate predicted income and expenses from budgets
    let predictedIncome = 0
    let predictedExpenses = 0

    relevantBudgets.forEach(budget => {
      const categoryType = categoryTypeMap.get(budget.categoryId)
      const amount = parseFloat(budget.amount)
      if (categoryType === 'income') {
        predictedIncome += amount
      } else if (categoryType === 'expense') {
        predictedExpenses += amount
      }
    })

    // Calculate actual income and expenses from filtered transactions
    const actualIncome = relevantTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const actualExpenses = relevantTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const predictedBalance = predictedIncome - predictedExpenses
    const actualBalance = actualIncome - actualExpenses

    return {
      predictedIncome,
      predictedExpenses,
      predictedBalance,
      actualIncome,
      actualExpenses,
      actualBalance,
    }
  }

  const budgetComparison = calculateBudgetComparison()

  // Combine regular transactions and recurring transactions for "last 5" display
  // Convert recurring transactions to transaction-like format using createdAt
  const allTransactionsForDisplay = useMemo(() => {
    const regularTxns = filteredTransactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      categoryId: t.categoryId,
      description: t.description,
      createdAt: t.createdAt,
      date: t.date, // Keep date for display
    }))

    // Convert recurring transactions to transaction-like format
    const recurringTxns = recurringTransactions
      .filter(rt => rt.isActive) // Only include active recurring transactions
      .map(rt => ({
        id: rt.id,
        type: rt.type,
        amount: rt.amount,
        categoryId: rt.categoryId,
        description: rt.description,
        createdAt: rt.createdAt, // Use createdAt for sorting
        date: rt.startDate, // Use startDate for display
      }))

    return [...regularTxns, ...recurringTxns]
  }, [filteredTransactions, recurringTransactions])

  // Get last 5 income payments (sorted by createdAt)
  const lastIncomePayments = allTransactionsForDisplay 
    .filter(t => t.type === 'income')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(t => ({
      amount: formatCurrency(parseFloat(t.amount), currency),
      date: formatShortDate(t.date),
      description: t.description,
      categoryName: categoryMap.get(t.categoryId) || 'Income',
    }))

  // Get last 5 expense payments (sorted by createdAt)
  const lastExpensePayments = allTransactionsForDisplay
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
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
    budgetComparison,
    recurringTransactions: recurringTransactions.filter(rt => rt.isActive),
    categoryMap,
    isLoading,
    error,
  }
}

