import { useCategoryStore } from '@/store/categoryStore'
import type { Category } from '@/shared/types'

export function useCategories() {
  const categories = useCategoryStore((s) => s.categories)
  const isLoaded = useCategoryStore((s) => s.isLoaded)
  const load = useCategoryStore((s) => s.load)
  const addCategory = useCategoryStore((s) => s.addCategory)
  const renameCategory = useCategoryStore((s) => s.renameCategory)
  const deleteCategory = useCategoryStore((s) => s.deleteCategory)

  function byType(type: 'income' | 'expense'): Category[] {
    return categories.filter((c) => c.type === type && !c.isDeleted)
  }

  return { categories, isLoaded, load, addCategory, renameCategory, deleteCategory, byType }
}
