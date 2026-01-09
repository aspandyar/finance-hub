import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { categoryApi, type Category } from '../../services/categoryApi'
import { useAuth } from '../../contexts/AuthContext'

interface PredictionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (categoryId: string, amount: number, month: string) => void
  defaultCategoryId?: string
  defaultMonth?: string
  defaultAmount?: number
  isLoading?: boolean
  error?: string | null
}

export default function PredictionModal({
  isOpen,
  onClose,
  onConfirm,
  defaultCategoryId,
  defaultMonth,
  defaultAmount,
  isLoading = false,
  error,
}: PredictionModalProps) {
  const { user } = useAuth()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(defaultCategoryId || '')
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth || '')
  const [amount, setAmount] = useState<string>(defaultAmount ? defaultAmount.toString() : '')
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  // Get first day of next month as default
  useEffect(() => {
    if (!selectedMonth && !defaultMonth) {
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const year = nextMonth.getFullYear()
      const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
      setSelectedMonth(`${year}-${month}-01`)
    } else if (defaultMonth) {
      setSelectedMonth(defaultMonth)
    }
  }, [defaultMonth, selectedMonth])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id) return
      
      setIsLoadingCategories(true)
      try {
        const fetchedCategories = await categoryApi.getByUserId(user.id)
        setCategories(fetchedCategories)
        
        // Set default category if provided
        if (defaultCategoryId && !selectedCategoryId) {
          setSelectedCategoryId(defaultCategoryId)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen, user?.id, defaultCategoryId, selectedCategoryId])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (defaultCategoryId) {
        setSelectedCategoryId(defaultCategoryId)
      }
      if (defaultMonth) {
        setSelectedMonth(defaultMonth)
      }
      if (defaultAmount) {
        setAmount(defaultAmount.toString())
      }
    } else {
      setSelectedCategoryId('')
      setSelectedMonth('')
      setAmount('')
    }
  }, [isOpen, defaultCategoryId, defaultMonth, defaultAmount])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCategoryId && selectedMonth && amount) {
      const amountValue = parseFloat(amount)
      if (isNaN(amountValue) || amountValue <= 0) {
        return
      }
      onConfirm(selectedCategoryId, amountValue, selectedMonth)
    }
  }

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Create Budget Prediction</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            {isLoadingCategories ? (
              <div className="text-sm text-gray-500">Loading categories...</div>
            ) : (
              <div className="space-y-3">
                {incomeCategories.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Income Categories
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {incomeCategories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(category.id)}
                          className={`
                            p-3 rounded-lg border-2 transition-all text-left
                            ${selectedCategoryId === category.id
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {expenseCategories.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Expense Categories
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {expenseCategories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(category.id)}
                          className={`
                            p-3 rounded-lg border-2 transition-all text-left
                            ${selectedCategoryId === category.id
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {categories.length === 0 && (
                  <p className="text-sm text-gray-500">No categories available</p>
                )}
              </div>
            )}
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the monthly budget amount
            </p>
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month *
            </label>
            <input
              type="date"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="mt-1 text-xs text-gray-500">
              Select the first day of the target month
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedCategoryId || !selectedMonth || !amount || parseFloat(amount) <= 0}
              className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Prediction'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  )
}
