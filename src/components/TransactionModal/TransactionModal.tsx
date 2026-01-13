import { useState } from 'react'
import { X, Upload, Calendar, MessageSquare, Loader2 } from 'lucide-react'
import { 
  Wallet, 
  ShoppingBag, 
  UtensilsCrossed, 
  Car, 
  Home, 
  Heart,
  Briefcase,
  GraduationCap,
  Gift,
  Code,
  TrendingUp,
  DollarSign,
  Zap,
  MoreHorizontal,
  Film,
  type LucideIcon
} from 'lucide-react'
import { 
  TransactionType, 
  FrequencyType
} from '../../constants'
import { useAuth } from '../../contexts/AuthContext'
import { useCategories } from '../../hooks/useCategories'
import { useTransaction } from '../../hooks/useTransaction'
import { validateTransactionForm } from '../../utils/transactionValidations'
import type { Category } from '../../services/categoryApi'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Map icon names from backend to Lucide React icons
const iconMap: Record<string, LucideIcon> = {
  'briefcase': Briefcase,
  'code': Code,
  'trending-up': TrendingUp,
  'gift': Gift,
  'dollar-sign': DollarSign,
  'utensils': UtensilsCrossed,
  'car': Car,
  'home': Home,
  'zap': Zap,
  'film': Film,
  'shopping-bag': ShoppingBag,
  'heart': Heart,
  'book': GraduationCap,
  'more-horizontal': MoreHorizontal,
}

export default function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const { user } = useAuth()
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE)
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [comment, setComment] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPeriod, setRecurringPeriod] = useState<FrequencyType>(FrequencyType.MONTHLY)
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endDate, setEndDate] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  
  // Fetch categories using hook
  const categoryType = type === TransactionType.INCOME ? 'income' : 'expense'
  const { 
    categories, 
    isLoading: isLoadingCategories, 
    error: categoriesError,
    refetch: refetchCategories 
  } = useCategories(user?.id, categoryType, isOpen)

  // Transaction creation hook
  const {
    isSubmitting,
    error: submitError,
    createTransaction,
    createRecurringTransaction,
    clearError,
  } = useTransaction()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError(null)

    // Validation
    const validation = validateTransactionForm({
      amount,
      selectedCategory,
      userId: user?.id,
    })

    if (!validation.isValid) {
      setValidationError(validation.error)
      return
    }

    try {
      const amountValue = parseFloat(amount)
      const transactionType = type
      const description = comment.trim() || null

      if (isRecurring) {
        // Create recurring transaction
        await createRecurringTransaction({
          categoryId: selectedCategory!,
          amount: amountValue,
          type: transactionType,
          description,
          frequency: recurringPeriod,
          startDate: new Date(date),
          endDate: hasEndDate && endDate ? new Date(endDate) : null,
        })
      } else {
        // Create regular transaction
        await createTransaction({
          categoryId: selectedCategory!,
          amount: amountValue,
          type: transactionType,
          description,
          date: date,
        })
      }

      // Call onSuccess callback if provided, otherwise reload page
      if (onSuccess) {
        onSuccess()
        onClose()
      } else {
        // Reload page to apply changes
        window.location.reload()
      }
    } catch (error) {
      // Error is already handled by the hook
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-modal w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setType(TransactionType.INCOME)
                setSelectedCategory(null) // Reset category when switching type
              }}
              className={`
                flex-1 py-2 px-4 rounded-md font-medium transition-all
                ${type === TransactionType.INCOME
                  ? 'bg-white text-income shadow-sm border-b-2 border-income' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => {
                setType(TransactionType.EXPENSE)
                setSelectedCategory(null) // Reset category when switching type
              }}
              className={`
                flex-1 py-2 px-4 rounded-md font-medium transition-all
                ${type === TransactionType.EXPENSE
                  ? 'bg-white text-expense shadow-sm border-b-2 border-expense' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Expense
            </button>
          </div>

          {/* Amount - Large centered input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Amount
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const value = e.target.value
                // Only allow numbers and a single decimal point
                const numericValue = value.replace(/[^0-9.]/g, '')
                // Ensure only one decimal point
                const parts = numericValue.split('.')
                const filteredValue = parts.length > 2 
                  ? parts[0] + '.' + parts.slice(1).join('')
                  : numericValue
                setAmount(filteredValue)
              }}
              placeholder="0"
              className="w-full text-4xl font-semibold text-center border-0 border-b-2 border-gray-300 focus:border-gray-900 focus:ring-0 pb-2 outline-none transition-colors"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading categories...</span>
              </div>
            ) : categoriesError ? (
              <div className="py-4 text-center">
                <p className="text-sm text-red-600">{categoriesError}</p>
                <button
                  type="button"
                  onClick={refetchCategories}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Retry
                </button>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">
                No categories available
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2 overflow-hidden">
                {categories.map((category: Category) => {
                  const Icon = iconMap[category.icon || ''] || Wallet
                  const isSelected = selectedCategory === category.id
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`
                        flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all min-w-0
                        ${isSelected 
                          ? 'border-gray-900 bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon size={18} className="flex-shrink-0" style={{ color: category.color }} />
                      <span className="text-xs text-gray-600 truncate w-full text-center">{category.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Comment
            </label>
            <div className="relative">
              <MessageSquare size={18} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional"
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked)
                  if (!e.target.checked) {
                    setHasEndDate(false)
                    setEndDate('')
                  }
                }}
                className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm font-medium text-gray-700">
                🔁 Recurring Transaction
              </span>
            </label>
            
            {isRecurring && (
              <>
                <div className="ml-8 flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setRecurringPeriod(FrequencyType.DAILY)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${recurringPeriod === FrequencyType.DAILY
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurringPeriod(FrequencyType.WEEKLY)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${recurringPeriod === FrequencyType.WEEKLY
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurringPeriod(FrequencyType.MONTHLY)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${recurringPeriod === FrequencyType.MONTHLY
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurringPeriod(FrequencyType.YEARLY)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${recurringPeriod === FrequencyType.YEARLY
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    Year
                  </button>
                </div>
                
                {/* End Date Toggle */}
                <div className="ml-8 space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasEndDate}
                      onChange={(e) => {
                        setHasEndDate(e.target.checked)
                        if (!e.target.checked) {
                          setEndDate('')
                        }
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Set End Date (Optional)
                    </span>
                  </label>
                  
                  {hasEndDate && (
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={date}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Attach Receipt */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              📎 Attach Receipt
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Upload size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Drag and drop a file here or click to select
              </p>
            </div>
          </div>

          {/* Submit Error */}
          {(submitError || validationError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{submitError || validationError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingCategories}
              className="flex-1 py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                'Add'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

