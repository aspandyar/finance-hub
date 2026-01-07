import type { Transaction } from '../services/transactionApi'
import { formatDate } from './formatters'

/**
 * Transform transactions into chart data format for line charts
 * Groups transactions by date and sums amounts
 */
export const transformTransactionsToChartData = (
  transactions: Transaction[]
): { date: string; value: number }[] => {
  // Group transactions by date and sum amounts
  const grouped = transactions.reduce((acc, transaction) => {
    const dateKey = transaction.date
    const amount = parseFloat(transaction.amount)
    
    if (!acc[dateKey]) {
      acc[dateKey] = 0
    }
    acc[dateKey] += amount
    
    return acc
  }, {} as Record<string, number>)

  // Convert to array, format, and sort by date
  return Object.entries(grouped)
    .map(([date, value]) => ({
      dateKey: date, // Keep original date for sorting
      date: formatDate(date),
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
    }))
    .sort((a, b) => new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime())
    .map(({ date, value }) => ({ date, value })) // Remove dateKey from final output
}

/**
 * Transform transactions into category chart data format for donut charts
 * Groups transactions by category and sums amounts
 */
export const transformTransactionsToCategoryData = (
  transactions: Transaction[],
  categories: Array<{ id: string; name: string; color: string }>
): Array<{ name: string; value: number; color: string }> => {
  return categories
    .map(cat => {
      // Calculate total amount for this category from transactions
      const categoryTotal = transactions
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      
      return {
        name: cat.name,
        value: Math.round(categoryTotal * 100) / 100,
        color: cat.color,
      }
    })
    .filter(cat => cat.value > 0)
    .sort((a, b) => b.value - a.value) // Sort by value descending
}

/**
 * Calculate balance history from transactions
 * Returns an array of balance values over time
 */
export const calculateBalanceHistory = (
  transactions: Transaction[],
  maxPoints: number = 12
): number[] => {
  // Sort transactions by date
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Calculate running balance
  let runningBalance = 0
  const balanceByDate: Record<string, number> = {}

  sorted.forEach(transaction => {
    const amount = parseFloat(transaction.amount)
    if (transaction.type === 'income') {
      runningBalance += amount
    } else {
      runningBalance -= amount
    }
    balanceByDate[transaction.date] = runningBalance
  })

  // Get last N data points (or all if less than N)
  const dates = Object.keys(balanceByDate).sort()
  const recentDates = dates.slice(-maxPoints)
  return recentDates.map(date => balanceByDate[date])
}

/**
 * Calculate dashboard metrics from transactions
 */
export const calculateDashboardMetrics = (transactions: Transaction[]) => {
  const incomeTransactions = transactions.filter(t => t.type === 'income')
  const expenseTransactions = transactions.filter(t => t.type === 'expense')

  const totalIncome = incomeTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount),
    0
  )

  const totalExpenses = expenseTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount),
    0
  )

  const balance = totalIncome - totalExpenses
  const savings = balance // Savings is the current balance
  const avgExpense = expenseTransactions.length > 0
    ? totalExpenses / expenseTransactions.length
    : 0

  return {
    totalIncome,
    totalExpenses,
    balance,
    savings,
    avgExpense,
    incomeCount: incomeTransactions.length,
    expenseCount: expenseTransactions.length,
  }
}

