import { useState, useEffect } from 'react'
import LineChart from './LineChart'
import DonutChart from './DonutChart'
import { categoryApi, type Category } from '../../services/categoryApi'
import { Loader2 } from 'lucide-react'

// Mock data for charts (this would come from transactions API in the future)
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

export default function ChartsSection() {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [expenseColor, setExpenseColor] = useState('#ef4444')
  const [incomeColor, setIncomeColor] = useState('#10b981')

  // Fetch expense categories to get colors
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const [expenseCats, incomeCats] = await Promise.all([
          categoryApi.getAll('expense'),
          categoryApi.getAll('income'),
        ])
        
        setExpenseCategories(expenseCats)
        
        // Use first category color for chart colors
        if (expenseCats.length > 0) {
          setExpenseColor(expenseCats[0]?.color || '#ef4444')
        }
        if (incomeCats.length > 0) {
          setIncomeColor(incomeCats[0]?.color || '#10b981')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Transform categories to chart data format (mock values - would come from transactions API)
  const categoryData = expenseCategories.slice(0, 5).map((cat, index) => ({
    name: cat.name,
    value: [12000, 8500, 6500, 4200, 900][index] || 1000, // Mock values
    color: cat.color,
  }))

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-2 gap-6">
        {/* Expenses Line Chart */}
        <div className="bg-white rounded-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenses Over Time</h3>
          <LineChart data={expensesData} color={expenseColor} />
        </div>

        {/* Income Line Chart */}
        <div className="bg-white rounded-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Income Over Time</h3>
          <LineChart data={incomeData} color={incomeColor} />
        </div>

        {/* Category Donut Chart */}
        <div className="bg-white rounded-card p-6 shadow-card col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenses by Category</h3>
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading categories...</span>
            </div>
          ) : categoryData.length > 0 ? (
            <DonutChart data={categoryData} />
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">
              No category data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

