import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface UseRegisterResult {
  isLoading: boolean
  error: string | null
  register: (email: string, password: string, fullName: string, currency?: string) => Promise<void>
  clearError: () => void
}

/**
 * Custom hook for user registration
 */
export const useRegister = (): UseRegisterResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register: registerUser } = useAuth()

  const register = async (
    email: string,
    password: string,
    fullName: string,
    currency: string = 'USD'
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await registerUser(email, password, fullName, currency)
    } catch (err: any) {
      // Provide more detailed error messages
      let errorMessage = 'Failed to register. Please try again.'
      
      if (err.status === 409) {
        errorMessage = 'This email is already registered. Please login instead.'
      } else if (err.status === 400) {
        errorMessage = err.data?.details 
          ? `Validation error: ${Array.isArray(err.data.details) ? err.data.details.join(', ') : err.data.details}`
          : err.message || 'Invalid input. Please check your information.'
      } else if (err.status === 0 || err.message?.includes('Failed to fetch') || err.message?.includes('Network')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    isLoading,
    error,
    register,
    clearError,
  }
}
