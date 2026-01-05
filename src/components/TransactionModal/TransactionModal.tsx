import { useState } from 'react'
import { X, Upload, Calendar, MessageSquare } from 'lucide-react'
import { 
  Wallet, 
  ShoppingBag, 
  UtensilsCrossed, 
  Car, 
  Home, 
  Heart,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Gift
} from 'lucide-react'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

type TransactionType = 'income' | 'expense'

const categories = [
  { id: 'food', name: 'Food', icon: UtensilsCrossed, color: 'text-orange-500' },
  { id: 'transport', name: 'Transport', icon: Car, color: 'text-blue-500' },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: 'text-pink-500' },
  { id: 'home', name: 'Home', icon: Home, color: 'text-green-500' },
  { id: 'health', name: 'Health', icon: Heart, color: 'text-red-500' },
  { id: 'work', name: 'Work', icon: Briefcase, color: 'text-purple-500' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'text-indigo-500' },
  { id: 'entertainment', name: 'Entertainment', icon: Gamepad2, color: 'text-yellow-500' },
  { id: 'gift', name: 'Gifts', icon: Gift, color: 'text-rose-500' },
  { id: 'other', name: 'Other', icon: Wallet, color: 'text-gray-500' },
]

export default function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [comment, setComment] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPeriod, setRecurringPeriod] = useState<'week' | 'month'>('month')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logic will be added later
    console.log({ type, amount, selectedCategory, date, comment, isRecurring, recurringPeriod })
    onClose()
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
              onClick={() => setType('income')}
              className={`
                flex-1 py-2 px-4 rounded-md font-medium transition-all
                ${type === 'income' 
                  ? 'bg-white text-income shadow-sm border-b-2 border-income' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`
                flex-1 py-2 px-4 rounded-md font-medium transition-all
                ${type === 'expense' 
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
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-4xl font-semibold text-center border-0 border-b-2 border-gray-300 focus:border-gray-900 focus:ring-0 pb-2 outline-none transition-colors"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <div className="grid grid-cols-5 gap-2 overflow-hidden">
              {categories.map((category) => {
                const Icon = category.icon
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
                    <Icon size={18} className={category.color} />
                    <span className="text-xs text-gray-600 truncate w-full text-center">{category.name}</span>
                  </button>
                )
              })}
            </div>
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
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm font-medium text-gray-700">
                🔁 Recurring Transaction
              </span>
            </label>
            
            {isRecurring && (
              <div className="ml-8 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRecurringPeriod('week')}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${recurringPeriod === 'week' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => setRecurringPeriod('month')}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${recurringPeriod === 'month' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  Month
                </button>
              </div>
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

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

