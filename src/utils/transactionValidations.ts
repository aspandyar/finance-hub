/**
 * Transaction form validation utilities
 */

export interface TransactionFormData {
  amount: string
  selectedCategory: string | null
  userId: string | undefined
}

export interface ValidationResult {
  isValid: boolean
  error: string | null
}

/**
 * Validates transaction form data
 */
export const validateTransactionForm = (data: TransactionFormData): ValidationResult => {
  // Validate amount
  if (!data.amount || data.amount.trim() === '') {
    return {
      isValid: false,
      error: 'Please enter an amount',
    }
  }

  const amountValue = parseFloat(data.amount)
  if (isNaN(amountValue) || amountValue <= 0) {
    return {
      isValid: false,
      error: 'Please enter a valid amount greater than 0',
    }
  }

  // Validate category
  if (!data.selectedCategory) {
    return {
      isValid: false,
      error: 'Please select a category',
    }
  }

  // Validate user authentication
  if (!data.userId) {
    return {
      isValid: false,
      error: 'User not authenticated',
    }
  }

  return {
    isValid: true,
    error: null,
  }
}

