import { create } from 'zustand'
import type { Category } from '@/shared/types'
import { CategoryService } from '@/server/services/CategoryService'

interface CategoryState {
  categories: Category[]
  isLoaded: boolean
}

interface CategoryActions {
  load: () => Promise<void>
  addCategory: (data: { name: string; type: 'income' | 'expense'; parentId?: string }) => Promise<void>
  renameCategory: (id: string, name: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

export const useCategoryStore = create<CategoryState & CategoryActions>((set, get) => ({
  categories: [],
  isLoaded: false,

  load: async () => {
    const categories = await CategoryService.getAll()
    set({ categories, isLoaded: true })
  },

  addCategory: async (data) => {
    await CategoryService.add(data)
    await get().load()
  },

  renameCategory: async (id, name) => {
    await CategoryService.rename(id, name)
    await get().load()
  },

  deleteCategory: async (id) => {
    await CategoryService.softDelete(id)
    await get().load()
  },
}))
