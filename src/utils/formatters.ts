/**
 * Format currency value with proper locale formatting
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format date to "Mon Day" format (e.g., "Jan 1")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  return `${month} ${day}`
}

/**
 * Format date to full date string (e.g., "January 1, 2024")
 */
export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format date to short date string (e.g., "01/01/2024")
 */
export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

