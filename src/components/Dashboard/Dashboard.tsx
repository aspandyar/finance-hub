import { TrendingUp, TrendingDown, PiggyBank, BarChart3, Loader2 } from 'lucide-react'
import MetricCard from './MetricCard'
import { useAuth } from '../../contexts/AuthContext'
import { useDashboardData } from '../../hooks/useDashboardData'
import { formatCurrency } from '../../utils/formatters'

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
    budgetComparison,
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
          subtitle={
            budgetComparison
              ? `Predicted: ${formatCurrency(budgetComparison.predictedBalance, user?.currency || 'USD')} | Actual: ${formatCurrency(budgetComparison.actualBalance, user?.currency || 'USD')}`
              : "As of today"
          }
          isWide={true}
          sparkline={<Sparkline dataPoints={balanceHistory} />}
          additionalContent={
            budgetComparison ? (
              <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Budget vs Actual (This Month)
                  </p>
                  
                  {/* Income Comparison */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Income:</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">
                          Predicted: <span className="font-medium text-gray-700">{formatCurrency(budgetComparison.predictedIncome, user?.currency || 'USD')}</span>
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">
                          Actual: <span className={`font-medium ${budgetComparison.actualIncome >= budgetComparison.predictedIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(budgetComparison.actualIncome, user?.currency || 'USD')}
                          </span>
                        </span>
                      </div>
                    </div>
                    {budgetComparison.predictedIncome > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            budgetComparison.actualIncome >= budgetComparison.predictedIncome
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (budgetComparison.actualIncome / budgetComparison.predictedIncome) * 100)}%`
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Expense Comparison */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Expenses:</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">
                          Predicted: <span className="font-medium text-gray-700">{formatCurrency(budgetComparison.predictedExpenses, user?.currency || 'USD')}</span>
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">
                          Actual: <span className={`font-medium ${budgetComparison.actualExpenses <= budgetComparison.predictedExpenses ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(budgetComparison.actualExpenses, user?.currency || 'USD')}
                          </span>
                        </span>
                      </div>
                    </div>
                    {budgetComparison.predictedExpenses > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            budgetComparison.actualExpenses <= budgetComparison.predictedExpenses
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (budgetComparison.actualExpenses / budgetComparison.predictedExpenses) * 100)}%`
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Balance Comparison */}
                  <div className="space-y-1 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Balance:</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">
                          Predicted: <span className={`font-medium ${budgetComparison.predictedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(budgetComparison.predictedBalance, user?.currency || 'USD')}
                          </span>
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">
                          Actual: <span className={`font-medium ${budgetComparison.actualBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(budgetComparison.actualBalance, user?.currency || 'USD')}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : undefined
          }
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
                  5 Last Income
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
                  5 Last Expense
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

