import LineChart from './LineChart'
import DonutChart from './DonutChart'

// Mock data
const expensesData = [
  { date: 'Jan 1', value: 3200 },
  { date: 'Jan 5', value: 2800 },
  { date: 'Jan 10', value: 3500 },
  { date: 'Jan 15', value: 4100 },
  { date: 'Jan 20', value: 2900 },
  { date: 'Jan 25', value: 3800 },
  { date: 'Jan 30', value: 3200 },
]

const incomeData = [
  { date: 'Jan 1', value: 45000 },
  { date: 'Jan 5', value: 45000 },
  { date: 'Jan 10', value: 45000 },
  { date: 'Jan 15', value: 45000 },
  { date: 'Jan 20', value: 45000 },
  { date: 'Jan 25', value: 45000 },
  { date: 'Jan 30', value: 45000 },
]

const categoryData = [
  { name: 'Food', value: 12000, color: '#f59e0b' },
  { name: 'Transport', value: 8500, color: '#3b82f6' },
  { name: 'Shopping', value: 6500, color: '#ec4899' },
  { name: 'Home', value: 4200, color: '#10b981' },
  { name: 'Other', value: 900, color: '#9ca3af' },
]

export default function ChartsSection() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-2 gap-6">
        {/* Expenses Line Chart */}
        <div className="bg-white rounded-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenses Over Time</h3>
          <LineChart data={expensesData} color="#ef4444" />
        </div>

        {/* Income Line Chart */}
        <div className="bg-white rounded-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Income Over Time</h3>
          <LineChart data={incomeData} color="#10b981" />
        </div>

        {/* Category Donut Chart */}
        <div className="bg-white rounded-card p-6 shadow-card col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenses by Category</h3>
          <DonutChart data={categoryData} />
        </div>
      </div>
    </div>
  )
}

