import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { recurringTransactionApi, type RecurringTransaction } from '../../services/recurringTransactionApi';
import { categoryApi, type Category } from '../../services/categoryApi';
import { formatCurrency, formatFullDate } from '../../utils/formatters';
import RecurringTransactionModal from '../RecurringTransactionModal/RecurringTransactionModal';
import TransactionModal from '../TransactionModal/TransactionModal';

type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const frequencyLabels: Record<FrequencyType, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export default function RecurringTransactions() {
  const { user } = useAuth();
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringTransaction | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'delete' | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const [fetchedRecurring, fetchedCategories] = await Promise.all([
        recurringTransactionApi.getByUserId(user.id),
        categoryApi.getByUserId(user.id),
      ]);
      setRecurringTransactions(fetchedRecurring);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch recurring transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (recurring: RecurringTransaction) => {
    setSelectedRecurring(recurring);
    setModalMode('edit');
  };

  const handleDelete = (recurring: RecurringTransaction) => {
    setSelectedRecurring(recurring);
    setModalMode('delete');
  };

  const handleModalClose = () => {
    setSelectedRecurring(null);
    setModalMode(null);
  };

  const handleSuccess = () => {
    fetchData();
  };

  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  const filteredRecurring = recurringTransactions.filter((rt) => {
    if (filterActive === 'active') return rt.isActive;
    if (filterActive === 'inactive') return !rt.isActive;
    return true;
  });

  const getFrequencyBadgeColor = (frequency: FrequencyType) => {
    switch (frequency) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-purple-100 text-purple-800';
      case 'monthly':
        return 'bg-green-100 text-green-800';
      case 'yearly':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recurring Transactions</h1>
          <p className="text-gray-600 mt-1">Manage your recurring income and expenses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFilterActive(filterActive === 'all' ? 'active' : filterActive === 'active' ? 'inactive' : 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            {filterActive === 'all' && 'All'}
            {filterActive === 'active' && 'Active Only'}
            {filterActive === 'inactive' && 'Inactive Only'}
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Create Recurring Transaction
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-gray-400" size={32} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRecurring.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recurring Transactions</h3>
          <p className="text-gray-600 mb-4">
            {filterActive === 'all'
              ? "You don't have any recurring transactions yet."
              : filterActive === 'active'
              ? "You don't have any active recurring transactions."
              : "You don't have any inactive recurring transactions."}
          </p>
          {filterActive === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Create Your First Recurring Transaction
            </button>
          )}
        </div>
      )}

      {/* Recurring Transactions List */}
      {!isLoading && filteredRecurring.length > 0 && (
        <div className="grid gap-4">
          {filteredRecurring.map((recurring) => {
            const category = categoryMap.get(recurring.categoryId);
            const amount = parseFloat(recurring.amount);

            return (
              <div
                key={recurring.id}
                className={`bg-white rounded-lg border-2 p-6 transition-all hover:shadow-md ${
                  !recurring.isActive ? 'opacity-60 border-gray-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* Left Side - Transaction Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: category?.color || '#6B7280' }}
                      >
                        {category?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {category?.name || 'Unknown Category'}
                          </h3>
                          {!recurring.isActive && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        {recurring.description && (
                          <p className="text-sm text-gray-600">{recurring.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-gray-400" size={18} />
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p
                            className={`text-sm font-semibold ${
                              recurring.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {recurring.type === 'income' ? '+' : '-'}
                            {formatCurrency(amount, user?.currency || 'USD')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="text-gray-400" size={18} />
                        <div>
                          <p className="text-xs text-gray-500">Frequency</p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getFrequencyBadgeColor(
                              recurring.frequency
                            )}`}
                          >
                            {frequencyLabels[recurring.frequency]}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatFullDate(recurring.startDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Next Occurrence</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatFullDate(recurring.nextOccurrence)}
                        </p>
                      </div>
                    </div>

                    {/* End Date */}
                    {recurring.endDate && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Ends: <span className="font-medium">{formatFullDate(recurring.endDate)}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex items-start gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(recurring)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(recurring)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedRecurring && modalMode && (
        <RecurringTransactionModal
          isOpen={true}
          onClose={handleModalClose}
          recurringTransaction={selectedRecurring}
          mode={modalMode}
          onSuccess={handleSuccess}
        />
      )}

      {isCreateModalOpen && (
        <TransactionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
