import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { recurringTransactionApi, type RecurringTransaction, type EditScope, type DeleteScope } from '../../services/recurringTransactionApi';
import { categoryApi, type Category } from '../../services/categoryApi';
import { formatCurrency } from '../../utils/formatters';

interface RecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recurringTransaction: RecurringTransaction | null;
  mode: 'edit' | 'delete';
  onSuccess: () => void;
}

type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Helper function to format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function RecurringTransactionModal({
  isOpen,
  onClose,
  recurringTransaction,
  mode,
  onSuccess,
}: RecurringTransactionModalProps) {
  const [scope, setScope] = useState<'single' | 'future' | 'all'>('single');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form fields
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('monthly');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isOpen && recurringTransaction) {
      setError(null);

      // Set default effective date to next occurrence or today, whichever is later
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextOccurrence = new Date(recurringTransaction.nextOccurrence);
      nextOccurrence.setHours(0, 0, 0, 0);
      const startDate = new Date(recurringTransaction.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      // Use the latest of: today, nextOccurrence, or startDate
      let defaultDate = today;
      if (nextOccurrence > defaultDate) defaultDate = nextOccurrence;
      if (startDate > defaultDate) defaultDate = startDate;
      
      // Ensure it's within the recurring transaction's date range
      const endDateObj = recurringTransaction.endDate ? new Date(recurringTransaction.endDate) : null;
      if (endDateObj && defaultDate > endDateObj) {
        defaultDate = endDateObj;
      }
      
      setEffectiveDate(defaultDate.toISOString().split('T')[0]!);

      // Pre-fill form for edit mode
      if (mode === 'edit') {
        setAmount(recurringTransaction.amount);
        setCategoryId(recurringTransaction.categoryId);
        setType(recurringTransaction.type);
        setDescription(recurringTransaction.description || '');
        setFrequency(recurringTransaction.frequency);
        setEndDate(recurringTransaction.endDate || '');
        setIsActive(recurringTransaction.isActive);
        setScope('single'); // Default to single for edit
      } else {
        setScope('single'); // Default to single for delete
      }
    }
  }, [isOpen, recurringTransaction, mode]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await categoryApi.getAll();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recurringTransaction) return;

    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'edit') {
        // Validate effective date
        if (!effectiveDate) {
          setError('Effective date is required.');
          setIsLoading(false);
          return;
        }

        // Validate effective date is within recurring transaction's date range
        const effectiveDateObj = new Date(effectiveDate);
        effectiveDateObj.setHours(0, 0, 0, 0);
        const startDate = new Date(recurringTransaction.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDateObj = recurringTransaction.endDate ? new Date(recurringTransaction.endDate) : null;
        if (endDateObj) endDateObj.setHours(23, 59, 59, 999);

        if (effectiveDateObj < startDate) {
          setError(`Effective date cannot be before the recurring transaction start date (${formatDate(recurringTransaction.startDate)}).`);
          setIsLoading(false);
          return;
        }
        if (endDateObj && effectiveDateObj > endDateObj) {
          setError(`Effective date cannot be after the recurring transaction end date (${formatDate(recurringTransaction.endDate!)}).`);
          setIsLoading(false);
          return;
        }

        // Validate required fields
        if (!amount || parseFloat(amount) <= 0) {
          setError('Amount must be greater than 0.');
          setIsLoading(false);
          return;
        }

        if (!categoryId) {
          setError('Category is required.');
          setIsLoading(false);
          return;
        }

        const updateData: any = {
          scope: scope as EditScope,
          effectiveDate,
        };

        // For 'single' scope, always send all fields to create/update override
        // For 'future' and 'all' scopes, only send fields that are different
        if (scope === 'single') {
          // Always include all fields for single scope (creates override)
          updateData.amount = parseFloat(amount);
          updateData.categoryId = categoryId;
          updateData.type = type;
          updateData.description = description || null;
        } else {
          // For 'future' and 'all', only include changed fields
          if (amount !== recurringTransaction.amount) {
            updateData.amount = parseFloat(amount);
          }
          if (categoryId !== recurringTransaction.categoryId) {
            updateData.categoryId = categoryId;
          }
          if (type !== recurringTransaction.type) {
            updateData.type = type;
          }
          if (description !== (recurringTransaction.description || '')) {
            updateData.description = description || null;
          }
          if (frequency !== recurringTransaction.frequency) {
            updateData.frequency = frequency;
          }
          if (endDate !== (recurringTransaction.endDate || '')) {
            updateData.endDate = endDate || null;
          }
          if (isActive !== recurringTransaction.isActive) {
            updateData.isActive = isActive;
          }

          // Check if at least one field changed for future/all scopes
          const hasChanges = Object.keys(updateData).length > 2; // More than just scope and effectiveDate
          if (!hasChanges) {
            setError('No changes detected. Please update at least one field.');
            setIsLoading(false);
            return;
          }
        }

        await recurringTransactionApi.updateWithScope(recurringTransaction.id, updateData);
      } else {
        // Delete mode
        if (!effectiveDate) {
          setError('Effective date is required.');
          setIsLoading(false);
          return;
        }

        // Validate effective date is within recurring transaction's date range
        const effectiveDateObj = new Date(effectiveDate);
        effectiveDateObj.setHours(0, 0, 0, 0);
        const startDate = new Date(recurringTransaction.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDateObj = recurringTransaction.endDate ? new Date(recurringTransaction.endDate) : null;
        if (endDateObj) endDateObj.setHours(23, 59, 59, 999);

        if (effectiveDateObj < startDate) {
          setError(`Effective date cannot be before the recurring transaction start date (${formatDate(recurringTransaction.startDate)}).`);
          setIsLoading(false);
          return;
        }
        if (endDateObj && effectiveDateObj > endDateObj) {
          setError(`Effective date cannot be after the recurring transaction end date (${formatDate(recurringTransaction.endDate!)}).`);
          setIsLoading(false);
          return;
        }

        await recurringTransactionApi.deleteWithScope(recurringTransaction.id, {
          scope: scope as DeleteScope,
          effectiveDate,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || err?.data?.error || 'An error occurred. Please try again.');
      console.error('Failed to update/delete recurring transaction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !recurringTransaction) return null;

  const getScopeDescription = () => {
    switch (scope) {
      case 'single':
        return mode === 'edit'
          ? 'Edit only this occurrence. Creates an override transaction for the selected date.'
          : 'Delete only this occurrence. The recurring transaction will continue for other dates.';
      case 'future':
        return mode === 'edit'
          ? 'Edit this and all future occurrences. Splits the series into two: original (ended) and new (starting from effective date).'
          : 'Delete this and all future occurrences. Ends the recurring transaction at the day before the effective date.';
      case 'all':
        return mode === 'edit'
          ? 'Edit the entire series. Updates all occurrences (past transactions remain unchanged).'
          : 'Delete the entire series. Completely removes the recurring transaction.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Recurring Transaction' : 'Delete Recurring Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Scope Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Scope
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['single', 'future', 'all'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${scope === s
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600">{getScopeDescription()}</p>
          </div>

          {/* Effective Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              min={recurringTransaction.startDate}
              max={recurringTransaction.endDate || undefined}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              {mode === 'edit'
                ? 'The date from which the changes will apply.'
                : 'The date from which the deletion will apply.'}
              {recurringTransaction.endDate && (
                <span className="block mt-1">
                  Must be between {formatDate(recurringTransaction.startDate)} and {formatDate(recurringTransaction.endDate)}.
                </span>
              )}
            </p>
          </div>

          {/* Edit Form Fields */}
          {mode === 'edit' && (
            <>
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories
                    .filter((cat) => cat.type === type)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setType('income');
                      // Reset category if current category doesn't match new type
                      const currentCategory = categories.find(cat => cat.id === categoryId);
                      if (currentCategory && currentCategory.type !== 'income') {
                        setCategoryId('');
                      }
                    }}
                    className={`
                      flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${type === 'income'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('expense');
                      // Reset category if current category doesn't match new type
                      const currentCategory = categories.find(cat => cat.id === categoryId);
                      if (currentCategory && currentCategory.type !== 'expense') {
                        setCategoryId('');
                      }
                    }}
                    className={`
                      flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${type === 'expense'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    Expense
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Frequency (only for future and all scopes) */}
              {scope !== 'single' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {(['daily', 'weekly', 'monthly', 'yearly'] as FrequencyType[]).map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setFrequency(freq)}
                          className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${frequency === freq
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </>
              )}
            </>
          )}

          {/* Delete Confirmation */}
          {mode === 'delete' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action cannot be undone. Are you sure you want to{' '}
                {scope === 'single' && 'delete this occurrence?'}
                {scope === 'future' && 'delete this and all future occurrences?'}
                {scope === 'all' && 'delete the entire recurring transaction series?'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`
                flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors
                ${mode === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-900 hover:bg-gray-800'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isLoading
                ? 'Processing...'
                : mode === 'edit'
                ? 'Update'
                : 'Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
