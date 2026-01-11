import { useState, useMemo, useEffect } from 'react'
import { Filter, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useDateFilter } from '../../contexts/DateFilterContext'
import { transactionApi, type Transaction } from '../../services/transactionApi'
import { recurringTransactionApi, type RecurringTransaction } from '../../services/recurringTransactionApi'
import { categoryApi, type Category } from '../../services/categoryApi'
import { convertRecurringToTransactions } from '../../utils/recurringTransactionHelpers'
import { formatCurrency, formatFullDate } from '../../utils/formatters'
import InvestmentDetailModal from './InvestmentDetailModal'

type FilterType = 'all' | 'income' | 'expense'

interface TransactionWithCategory extends Transaction {
  categoryName: string
  categoryColor: string
  isRecurring: boolean
  recurringId?: string
}

export default function History() {
  const { user } = useAuth()
  const { dateRange } = useDateFilter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedInvestment, setSelectedInvestment] = useState<TransactionWithCategory | null>(null)
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedInvestment) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedInvestment])

  // Fetch data function
  const fetchData = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const [fetchedTransactions, fetchedRecurringTransactions, fetchedCategories] = await Promise.all([
        transactionApi.getByUserId(user.id),
        recurringTransactionApi.getByUserId(user.id),
        categoryApi.getByUserId(user.id)
      ])
      setTransactions(fetchedTransactions)
      setRecurringTransactions(fetchedRecurringTransactions)
      setCategories(fetchedCategories)
    } catch (error) {
      console.error('Failed to fetch history data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data on mount and when user changes
  useEffect(() => {
    fetchData()
  }, [user?.id])

  // Create category map
  const categoryMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>()
    categories.forEach(cat => {
      map.set(cat.id, { name: cat.name, color: cat.color })
    })
    return map
  }, [categories])

  // Filter and combine transactions
  const allTransactions = useMemo(() => {
    // Filter regular transactions by date range
    let filtered = transactions
    if (dateRange.from || dateRange.to) {
      filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        const fromDate = dateRange.from ? new Date(dateRange.from) : null
        const toDate = dateRange.to ? new Date(dateRange.to) : null

        transactionDate.setHours(0, 0, 0, 0)
        if (fromDate) fromDate.setHours(0, 0, 0, 0)
        if (toDate) toDate.setHours(23, 59, 59, 999)

        if (fromDate && transactionDate < fromDate) return false
        if (toDate && transactionDate > toDate) return false

        return true
      })
    }

    // Convert recurring transactions to transaction instances
    const recurringInstances = convertRecurringToTransactions(
      recurringTransactions,
      dateRange.from,
      dateRange.to
    )

    // Combine and add category info
    const combined: TransactionWithCategory[] = [
      ...filtered.map(t => {
        const category = categoryMap.get(t.categoryId)
        return {
          ...t,
          categoryName: category?.name || 'Unknown',
          categoryColor: category?.color || '#6B7280',
          isRecurring: false
        }
      }),
      ...recurringInstances.map(t => {
        const category = categoryMap.get(t.categoryId)
        const recurringTxn = recurringTransactions.find(rt => 
          rt.categoryId === t.categoryId && 
          rt.amount === t.amount &&
          rt.type === t.type
        )
        return {
          ...t,
          categoryName: category?.name || 'Unknown',
          categoryColor: category?.color || '#6B7280',
          isRecurring: true,
          recurringId: recurringTxn?.id
        }
      })
    ]

    // Apply type filter
    if (filterType === 'income') {
      return combined.filter(t => t.type === 'income')
    } else if (filterType === 'expense') {
      return combined.filter(t => t.type === 'expense')
    }

    return combined
  }, [transactions, recurringTransactions, dateRange, categoryMap, filterType])

  // Sort by date (newest first)
  const sortedTransactions = useMemo(() => {
    return [...allTransactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
  }, [allTransactions])

  // Check if transaction is investment-related
  const isInvestment = (categoryName: string): boolean => {
    const investmentKeywords = ['investment', 'invest', 'stock', 'bond', 'portfolio', 'asset']
    return investmentKeywords.some(keyword => 
      categoryName.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  const handleTransactionClick = (transaction: TransactionWithCategory) => {
    // Make all transactions clickable, not just investments
    setSelectedInvestment(transaction)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading transaction history...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Transaction History</h1>
        <p className="text-sm text-gray-500">
          View all your transactions and recurring transactions over time
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by type:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filterType === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp size={16} />
              Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filterType === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingDown size={16} />
              Expenses
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {sortedTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No transactions found for the selected filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income'
              const isInv = isInvestment(transaction.categoryName)
              
              return (
                <div
                  key={transaction.id}
                  onClick={() => handleTransactionClick(transaction)}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Category Color Indicator */}
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: transaction.categoryColor }}
                      />
                      
                      {/* Transaction Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.categoryName}
                          </p>
                          {transaction.isRecurring && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                              Recurring
                            </span>
                          )}
                          {isInv && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                              Investment
                            </span>
                          )}
                        </div>
                        {transaction.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatFullDate(transaction.date)}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="ml-4 flex-shrink-0">
                      <p
                        className={`text-sm font-semibold ${
                          isIncome ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(parseFloat(transaction.amount), user?.currency || 'USD')}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedInvestment && (
        <InvestmentDetailModal
          transaction={selectedInvestment}
          onClose={() => setSelectedInvestment(null)}
          onUpdate={async (updatedTransactionData?: TransactionWithCategory) => {
            // If updated transaction data is provided, use it directly
            if (updatedTransactionData) {
              setSelectedInvestment(updatedTransactionData)
            }
            // Fetch fresh data to update the list
            await fetchData()
          }}
        />
      )}
    </div>
  )
}
