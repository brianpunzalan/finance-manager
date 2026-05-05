import { useShallow } from 'zustand/react/shallow'
import { useCategoryStore } from '@/store/categoryStore'
import type { Category } from '@/shared/types'

export function useCategories() {
  const state = useCategoryStore(
    useShallow((s) => ({
      categories: s.categories,
      isLoaded: s.isLoaded,
      load: s.load,
      addCategory: s.addCategory,
      renameCategory: s.renameCategory,
      deleteCategory: s.deleteCategory,
    }))
  )

  function byType(type: 'income' | 'expense'): Category[] {
    return state.categories.filter((c) => c.type === type && !c.isDeleted)
  }

  return { ...state, byType }
}
