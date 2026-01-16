import { useState, useEffect } from 'react'
import { X, TrendingUp, Calendar, DollarSign, Tag, Edit2, Trash2, Save, XCircle } from 'lucide-react'
import { formatCurrency, formatFullDate } from '../../utils/formatters'
import { transactionApi, type UpdateTransactionInput } from '../../services/transactionApi'
import { recurringTransactionApi, type RecurringTransaction } from '../../services/recurringTransactionApi'
import { useAuth } from '../../contexts/AuthContext'
import RecurringTransactionModal from '../RecurringTransactionModal/RecurringTransactionModal'
import type { Transaction } from '../../services/transactionApi'

interface TransactionWithCategory extends Transaction {
  categoryName: string
  categoryColor: string
  isRecurring: boolean
  recurringId?: string
}

interface InvestmentDetailModalProps {
  transaction: TransactionWithCategory
  onClose: () => void
  onUpdate?: (updatedTransaction?: TransactionWithCategory) => void
}

export default function InvestmentDetailModal({
  transaction,
  onClose,
  onUpdate
}: InvestmentDetailModalProps) {
  const { user } = useAuth()
  const isIncome = transaction.type === 'income'
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recurringTransaction, setRecurringTransaction] = useState<RecurringTransaction | null>(null)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [recurringModalMode, setRecurringModalMode] = useState<'edit' | 'delete' | null>(null)

  // Edit form state
  const [editAmount, setEditAmount] = useState(transaction.amount)
  const [editDescription, setEditDescription] = useState(transaction.description || '')
  const [editDate, setEditDate] = useState(transaction.date)

  // Update form state when transaction changes
  useEffect(() => {
    setEditAmount(transaction.amount)
    setEditDescription(transaction.description || '')
    setEditDate(transaction.date)
  }, [transaction])

  // Check if this is a recurring transaction instance
  const isRecurringInstance = transaction.id.startsWith('recurring-') || transaction.isRecurring

  // Fetch recurring transaction data if this is a recurring instance
  useEffect(() => {
    const fetchRecurringTransaction = async () => {
      if (isRecurringInstance) {
        // Try to get recurring ID from different possible sources
        let recurringId: string | undefined = undefined
        
        // First, try recurringTransactionId (from actual transactions)
        if ('recurringTransactionId' in transaction && transaction.recurringTransactionId) {
          recurringId = String(transaction.recurringTransactionId)
        }
        // Then try recurringId (from generated instances)
        else if (transaction.recurringId) {
          recurringId = transaction.recurringId
        }
        // Finally, try to extract from transaction ID format: recurring-{id}-{index}
        else if (transaction.id.startsWith('recurring-')) {
          // Format is: recurring-{uuid}-{index}
          // We need to extract the UUID part
          const match = transaction.id.match(/^recurring-(.+?)-(\d+)$/)
          if (match && match[1]) {
            recurringId = match[1]
          } else {
            // Fallback: try splitting by '-' and taking everything except first and last
            const parts = transaction.id.split('-')
            if (parts.length >= 3) {
              // Skip 'recurring' (index 0) and the last part (index), get the UUID
              recurringId = parts.slice(1, -1).join('-')
            }
          }
        }

        if (recurringId) {
          try {
            const recurring = await recurringTransactionApi.getById(recurringId)
            setRecurringTransaction(recurring)
          } catch (error) {
            console.error('Failed to fetch recurring transaction:', error)
            setError('Unable to load recurring transaction details. Please try again.')
          }
        } else {
          setError('Unable to identify recurring transaction. Please try from the Recurring Transactions page.')
        }
      }
    }

    fetchRecurringTransaction()
  }, [isRecurringInstance, transaction])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't close if editing or showing delete confirmation
    if (isEditing || showDeleteConfirm) {
      return
    }
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleEdit = () => {
    if (isRecurringInstance) {
      // Open recurring transaction modal for editing
      if (recurringTransaction) {
        setRecurringModalMode('edit')
        setShowRecurringModal(true)
      } else {
        setError('Unable to load recurring transaction details. Please try again.')
      }
    } else {
      setIsEditing(true)
      setError(null)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditAmount(transaction.amount)
    setEditDescription(transaction.description || '')
    setEditDate(transaction.date)
    setError(null)
  }

  const handleSave = async () => {
    if (isRecurringInstance) {
      setError('Cannot edit recurring transaction instances')
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      const updateData: UpdateTransactionInput = {
        amount: parseFloat(editAmount),
        description: editDescription || null,
        date: editDate,
      }

      const updatedTransaction = await transactionApi.update(transaction.id, updateData)
      
      // Create updated transaction with category info
      const updatedTransactionWithCategory: TransactionWithCategory = {
        ...updatedTransaction,
        categoryName: transaction.categoryName,
        categoryColor: transaction.categoryColor,
        isRecurring: transaction.isRecurring,
        recurringId: transaction.recurringId,
      }
      
      setIsEditing(false)
      setError(null)
      
      // Update local form state with the response
      setEditAmount(updatedTransaction.amount)
      setEditDescription(updatedTransaction.description || '')
      setEditDate(updatedTransaction.date)
      
      // Refresh data from server and update selected transaction
      if (onUpdate) {
        await onUpdate(updatedTransactionWithCategory)
      } else {
        // Fallback: reload page
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteClick = () => {
    if (isRecurringInstance) {
      // Open recurring transaction modal for deletion
      if (recurringTransaction) {
        setRecurringModalMode('delete')
        setShowRecurringModal(true)
      } else {
        setError('Unable to load recurring transaction details. Please try again.')
      }
    } else {
      setShowDeleteConfirm(true)
    }
  }

  const handleRecurringModalSuccess = () => {
    setShowRecurringModal(false)
    setRecurringModalMode(null)
    // Refresh data
    if (onUpdate) {
      onUpdate()
    } else {
      window.location.reload()
    }
  }

  const handleRecurringModalClose = () => {
    setShowRecurringModal(false)
    setRecurringModalMode(null)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      await transactionApi.delete(transaction.id)
      setShowDeleteConfirm(false)
      
      // Close modal first
      onClose()
      
      // Refresh data from server
      if (onUpdate) {
        await onUpdate()
      } else {
        // Fallback: reload page
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction')
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[60]"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={handleBackdropClick}>
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={handleEdit}
                    disabled={isRecurringInstance && !recurringTransaction}
                    className={`p-2 rounded-lg transition-colors ${
                      isRecurringInstance && !recurringTransaction
                        ? 'opacity-50 cursor-not-allowed bg-gray-100'
                        : 'hover:bg-gray-100'
                    }`}
                    title={isRecurringInstance ? 'Edit recurring transaction' : 'Edit transaction'}
                  >
                    <Edit2 size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={isRecurringInstance && !recurringTransaction}
                    className={`p-2 rounded-lg transition-colors ${
                      isRecurringInstance && !recurringTransaction
                        ? 'opacity-50 cursor-not-allowed bg-gray-100'
                        : 'hover:bg-red-50'
                    }`}
                    title={isRecurringInstance ? 'Delete recurring transaction' : 'Delete transaction'}
                  >
                    <Trash2 size={18} className={isRecurringInstance ? 'text-gray-600' : 'text-red-600'} />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Category */}
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: transaction.categoryColor }}
              />
              <div>
                <p className="text-sm font-medium text-gray-500">Category</p>
                <p className="text-lg font-semibold text-gray-900">{transaction.categoryName}</p>
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-gray-400" />
                <p className="text-sm font-medium text-gray-500">Amount</p>
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncome ? '+' : '-'}
                  </span>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    step="0.01"
                    min="0.01"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <p
                  className={`text-2xl font-bold ${
                    isIncome ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(parseFloat(transaction.amount), user?.currency || 'USD')}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-gray-400" />
                <p className="text-sm font-medium text-gray-500">Date</p>
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  placeholder="Select date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-base text-gray-900">{formatFullDate(transaction.date)}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag size={18} className="text-gray-400" />
                <p className="text-sm font-medium text-gray-500">Type</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={16}
                  className={isIncome ? 'text-green-600' : 'text-red-600'}
                />
                <p className="text-base font-medium text-gray-900 capitalize">
                  {transaction.type}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
              {isEditing ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add a description..."
                />
              ) : (
                <p className="text-base text-gray-700">
                  {transaction.description || <span className="text-gray-400 italic">No description</span>}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Recurring Status */}
            {isRecurringInstance && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Recurring Transaction</p>
                <p className="text-xs text-blue-700">
                  This is a recurring transaction instance. Click Edit or Delete to manage the recurring transaction with scope options (single occurrence, future occurrences, or entire series).
                </p>
              </div>
            )}

            {/* Transaction ID (for debugging) */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400">Transaction ID: {transaction.id}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog - Higher z-index than modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Transaction</h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setIsDeleting(false)
                }}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this {transaction.type} transaction of {formatCurrency(parseFloat(transaction.amount), user?.currency || 'USD')}? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setIsDeleting(false)
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Transaction Modal */}
      {showRecurringModal && recurringTransaction && recurringModalMode && (
        <RecurringTransactionModal
          isOpen={showRecurringModal}
          onClose={handleRecurringModalClose}
          recurringTransaction={recurringTransaction}
          mode={recurringModalMode}
          onSuccess={handleRecurringModalSuccess}
        />
      )}
    </>
  )
}
