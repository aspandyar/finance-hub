import { useState, useEffect } from 'react'
import LineChart from './LineChart'
import DonutChart from './DonutChart'
import { categoryApi, type Category } from '../../services/categoryApi'
import { transactionApi, type Transaction } from '../../services/transactionApi'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ChartsSection() {
  const { user } = useAuth()
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([])
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [expensesData, setExpensesData] = useState<{ date: string; value: number }[]>([])
  const [incomeData, setIncomeData] = useState<{ date: string; value: number }[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [expenseColor, setExpenseColor] = useState('#ef4444')
  const [incomeColor, setIncomeColor] = useState('#10b981')

  // Format date to "Mon Day" format (e.g., "Jan 1")
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    return `${month} ${day}`
  }

  // Transform transactions into chart data format
  const transformTransactionsToChartData = (transactions: Transaction[]): { date: string; value: number }[] => {
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

  // Fetch categories by user ID to get colors
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id) return
      
      setIsLoadingCategories(true)
      try {
        const allCategories = await categoryApi.getByUserId(user.id)
        
        // Filter by type
        const expenseCats = allCategories.filter(cat => cat.type === 'expense')
        const incomeCats = allCategories.filter(cat => cat.type === 'income')
        
        setExpenseCategories(expenseCats)
        setIncomeCategories(incomeCats)
        
        // Use first category color for chart colors
        if (expenseCats.length > 0) {
          setExpenseColor(expenseCats[0]?.color || '#ef4444')
        }
        if (incomeCats.length > 0) {
          setIncomeColor(incomeCats[0]?.color || '#10b981')
        }
      } catch (error) {
        // Silently handle error
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [user?.id])

  // Fetch transactions by user ID
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return
      
      setIsLoadingTransactions(true)
      try {
        const fetchedTransactions = await transactionApi.getByUserId(user.id)
        setTransactions(fetchedTransactions)
        
        // Filter and transform by type
        const expenseTransactions = fetchedTransactions.filter(t => t.type === 'expense')
        const incomeTransactions = fetchedTransactions.filter(t => t.type === 'income')
        
        setExpensesData(transformTransactionsToChartData(expenseTransactions))
        setIncomeData(transformTransactionsToChartData(incomeTransactions))
      } catch (error) {
        // Silently handle error
      } finally {
        setIsLoadingTransactions(false)
      }
    }

    fetchTransactions()
  }, [user?.id])

  // Transform expense categories to chart data format using actual transaction data
  const expenseCategoryData = expenseCategories
    .map(cat => {
      // Calculate total amount for this category from transactions
      const categoryTotal = transactions
        .filter(t => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      
      return {
        name: cat.name,
        value: Math.round(categoryTotal * 100) / 100,
        color: cat.color,
      }
    })
    .filter(cat => cat.value > 0)
    .sort((a, b) => b.value - a.value) // Sort by value descending
    .slice(0, 5)

  // Transform income categories to chart data format using actual transaction data
  const incomeCategoryData = incomeCategories
    .map(cat => {
      // Calculate total amount for this category from transactions
      const categoryTotal = transactions
        .filter(t => t.type === 'income' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      
      return {
        name: cat.name,
        value: Math.round(categoryTotal * 100) / 100,
        color: cat.color,
      }
    })
    .filter(cat => cat.value > 0)
    .sort((a, b) => b.value - a.value) // Sort by value descending
    .slice(0, 5)

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

