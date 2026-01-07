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

interface DateFilterProviderProps {
  children: ReactNode
}

export const DateFilterProvider = ({ children }: DateFilterProviderProps) => {
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null })

  const clearDateRange = () => {
    setDateRange({ from: null, to: null })
  }

  return (
    <DateFilterContext.Provider value={{ dateRange, setDateRange, clearDateRange }}>
      {children}
    </DateFilterContext.Provider>
  )
}

