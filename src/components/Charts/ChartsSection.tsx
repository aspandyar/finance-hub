import LineChart from './LineChart'
import DonutChart from './DonutChart'
import { useAuth } from '../../contexts/AuthContext'
import { useChartData } from '../../hooks/useChartData'
import { Loader2 } from 'lucide-react'

export default function ChartsSection() {
  const { user } = useAuth()
  const {
    expensesData,
    incomeData,
    expenseCategoryData,
    incomeCategoryData,
    expenseColor,
    incomeColor,
    isLoadingCategories,
    isLoadingTransactions,
  } = useChartData(user?.id)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-2 gap-6">
        {/* Expenses Line Chart */}
        <div className="bg-white rounded-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenses Over Time</h3>
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading data...</span>
            </div>
          ) : expensesData.length > 0 ? (
            <LineChart data={expensesData} color={expenseColor} />
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">
              No expense data available
            </div>
          )}
        </div>

        {/* Income Line Chart */}
        <div className="bg-white rounded-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Income Over Time</h3>
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading data...</span>
            </div>
          ) : incomeData.length > 0 ? (
            <LineChart data={incomeData} color={incomeColor} />
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">
              No income data available
            </div>
          )}
        </div>

        {/* Income by Category Donut Chart */}
        <div className="bg-white rounded-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Income by Category</h3>
          {isLoadingCategories || isLoadingTransactions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading data...</span>
            </div>
          ) : incomeCategoryData.length > 0 ? (
            <DonutChart data={incomeCategoryData} />
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">
              No income category data available
            </div>
          )}
        </div>

        {/* Expenses by Category Donut Chart */}
        <div className="bg-white rounded-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenses by Category</h3>
          {isLoadingCategories || isLoadingTransactions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading data...</span>
            </div>
          ) : expenseCategoryData.length > 0 ? (
            <DonutChart data={expenseCategoryData} />
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">
              No expense category data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

