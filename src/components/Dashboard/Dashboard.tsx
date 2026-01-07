import { TrendingUp, TrendingDown, PiggyBank, BarChart3, Loader2 } from 'lucide-react'
import MetricCard from './MetricCard'
import { useAuth } from '../../contexts/AuthContext'
import { useDashboardData } from '../../hooks/useDashboardData'

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

export default function Dashboard() {
  const { user } = useAuth()
  const {
    balance,
    totalIncome,
    totalExpenses,
    savings,
    avgExpense,
    balanceHistory,
    lastIncomePayments,
    lastExpensePayments,
    isLoading,
  } = useDashboardData(user?.id, user?.currency || 'USD')

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
          value={balance}
          subtitle="As of today"
          isWide={true}
          sparkline={<Sparkline dataPoints={balanceHistory} />}
        />

        {/* Income */}
        <MetricCard
          title="Income"
          value={totalIncome}
          icon={<TrendingUp size={20} />}
          color="income"
          additionalContent={
            lastIncomePayments.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  3 Last Income
                </p>
                {lastIncomePayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 truncate">
                        {payment.categoryName}
                      </p>
                      <p className="text-gray-500 text-[10px]">{payment.date}</p>
                    </div>
                    <p className="text-income font-medium ml-2 flex-shrink-0">
                      {payment.amount}
                    </p>
                  </div>
                ))}
              </div>
            ) : undefined
          }
        />

        {/* Expenses */}
        <MetricCard
          title="Expenses"
          value={totalExpenses}
          icon={<TrendingDown size={20} />}
          color="expense"
          additionalContent={
            lastExpensePayments.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  3 Last Expense
                </p>
                {lastExpensePayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 truncate">
                        {payment.categoryName}
                      </p>
                      <p className="text-gray-500 text-[10px]">{payment.date}</p>
                    </div>
                    <p className="text-expense font-medium ml-2 flex-shrink-0">
                      {payment.amount}
                    </p>
                  </div>
                ))}
              </div>
            ) : undefined
          }
        />

        {/* Savings */}
        <MetricCard
          title="Savings"
          value={savings}
          icon={<PiggyBank size={20} />}
          color="savings"
        />

        {/* Average Expense */}
        <MetricCard
          title="Avg. Expense"
          value={avgExpense}
          icon={<BarChart3 size={20} />}
          color="neutral"
        />
      </div>
    </div>
  )
}

