import { useState, useEffect, useCallback } from 'react'
import { categoryApi, type Category } from '../services/categoryApi'

interface UseCategoriesResult {
  categories: Category[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Custom hook for fetching categories by user ID and type
 * @param userId - The user ID to fetch categories for
 * @param type - The category type ('income' | 'expense')
 * @param enabled - Whether to fetch categories (default: true)
 */
export const useCategories = (
  userId: string | undefined,
  type: 'income' | 'expense',
  enabled: boolean = true
): UseCategoriesResult => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!userId || !enabled) {
      setCategories([])
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const allCategories = await categoryApi.getByUserId(userId)
      // Filter by type
      const filteredCategories = allCategories.filter(cat => cat.type === type)
      setCategories(filteredCategories)
    } catch (err: any) {
      setError(err.message || 'Failed to load categories')
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, type, enabled])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  }
}

