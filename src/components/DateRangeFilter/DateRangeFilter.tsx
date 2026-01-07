import { useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { useDateFilter } from '../../contexts/DateFilterContext'

export default function DateRangeFilter() {
  const { dateRange, setDateRange, clearDateRange } = useDateFilter()
  const [isOpen, setIsOpen] = useState(false)

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({
      ...dateRange,
      from: e.target.value || null,
    })
  }

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({
      ...dateRange,
      to: e.target.value || null,
    })
  }

  const hasActiveFilter = dateRange.from || dateRange.to

  // Get today's date in YYYY-MM-DD format for max date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium ${
          hasActiveFilter
            ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Calendar size={18} />
        <span className="text-sm">
          {hasActiveFilter
            ? `${dateRange.from || 'Start'} - ${dateRange.to || 'End'}`
            : 'Filter by Date'}
        </span>
        {hasActiveFilter && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              clearDateRange()
            }}
            className="ml-1 p-0.5 rounded hover:bg-blue-200"
          >
            <X size={14} />
          </button>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Date Range Filter</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.from || ''}
                    onChange={handleFromDateChange}
                    max={dateRange.to || today}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.to || ''}
                    onChange={handleToDateChange}
                    min={dateRange.from || undefined}
                    max={today}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {hasActiveFilter && (
                <button
                  onClick={() => {
                    clearDateRange()
                    setIsOpen(false)
                  }}
                  className="w-full mt-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

