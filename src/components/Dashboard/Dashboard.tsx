import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, PiggyBank, BarChart3, Loader2 } from 'lucide-react'
import MetricCard from './MetricCard'
import { transactionApi, type Transaction } from '../../services/transactionApi'
import { useAuth } from '../../contexts/AuthContext'

// Sparkline component that takes data points
function Sparkline({ dataPoints }: { dataPoints: number[] }) {
  if (dataPoints.length === 0) {
    return <div className="w-full h-full" />
  }

  const max = Math.max(...dataPoints)
  const min = Math.min(...dataPoints)
  const range = max - min || 1
  // Scale to use middle 60% of height (20% to 80%) for better visual balance
  const normalized = dataPoints.map(p => ((p - min) / range) * 20 + 10)

  return (
    <div className="w-full h-full overflow-hidden">
      <svg 
        className="w-full h-full" 
        viewBox="0 0 100 40" 
        preserveAspectRatio="none" 
        style={{ display: 'block' }}
      >
        <polyline
          points={normalized.map((y, i) => {
            const x = (i / (normalized.length - 1)) * 100
            return `${x},${40 - y}`
          }).join(' ')}
          fill="none"
          stroke="#d1d5db"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

// Format currency value
const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function Dashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return

      setIsLoading(true)
      try {
        const fetchedTransactions = await transactionApi.getByUserId(user.id)
        setTransactions(fetchedTransactions)
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user?.id])

  // Calculate metrics from transactions
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

  // Generate sparkline data from balance over time
  // Group transactions by date and calculate running balance
  const balanceHistory = (() => {
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

    // Get last 12 data points (or all if less than 12)
    const dates = Object.keys(balanceByDate).sort()
    const recentDates = dates.slice(-12)
    return recentDates.map(date => balanceByDate[date])
  })()

  const currency = user?.currency || 'USD'

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading dashboard data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-4 gap-6">
        {/* Balance - Wide card */}
        <MetricCard
          title="Balance"
          value={formatCurrency(balance, currency)}
          subtitle="As of today"
          isWide={true}
          sparkline={<Sparkline dataPoints={balanceHistory} />}
        />

        {/* Income */}
        <MetricCard
          title="Income"
          value={formatCurrency(totalIncome, currency)}
          icon={<TrendingUp size={20} />}
          color="income"
        />

        {/* Expenses */}
        <MetricCard
          title="Expenses"
          value={formatCurrency(totalExpenses, currency)}
          icon={<TrendingDown size={20} />}
          color="expense"
        />

        {/* Savings */}
        <MetricCard
          title="Savings"
          value={formatCurrency(savings, currency)}
          icon={<PiggyBank size={20} />}
          color="savings"
        />

        {/* Average Expense */}
        <MetricCard
          title="Avg. Expense"
          value={formatCurrency(avgExpense, currency)}
          icon={<BarChart3 size={20} />}
          color="neutral"
        />
      </div>
    </div>
  )
}

