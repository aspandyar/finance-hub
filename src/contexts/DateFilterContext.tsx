import { createContext, useContext, useState, ReactNode } from 'react'

interface DateRange {
  from: string | null
  to: string | null
}

interface DateFilterContextType {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  clearDateRange: () => void
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined)

export const useDateFilter = () => {
  const context = useContext(DateFilterContext)
  if (!context) {
    throw new Error('useDateFilter must be used within a DateFilterProvider')
  }
  return context
}

// Helper function to get current month date range
const getCurrentMonthRange = (): DateRange => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  // First day of current month
  const fromDate = new Date(year, month, 1)
  const from = fromDate.toISOString().split('T')[0]
  
  // Last day of current month
  const toDate = new Date(year, month + 1, 0)
  const to = toDate.toISOString().split('T')[0]
  
  return { from, to }
}

interface DateFilterProviderProps {
  children: ReactNode
}

export const DateFilterProvider = ({ children }: DateFilterProviderProps) => {
  // Initialize with current month as default
  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthRange())

  const clearDateRange = () => {
    // When clearing, reset to current month (not null)
    setDateRange(getCurrentMonthRange())
  }

  return (
    <DateFilterContext.Provider value={{ dateRange, setDateRange, clearDateRange }}>
      {children}
    </DateFilterContext.Provider>
  )
}

