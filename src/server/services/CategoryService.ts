import { db } from '@/server/db/db'
import type { Category } from '@/shared/types'

const SYSTEM_IDS = new Set(['__uncategorized__', '__general_income__'])

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    const all = await db.categories.toArray()
    return all.filter((c) => !c.isDeleted)
  },

  async add(data: { name: string; type: 'income' | 'expense'; parentId?: string }): Promise<void> {
    if (!data.name.trim()) throw new Error('Category name is required')
    const count = await db.categories.count()
    await db.categories.add({
      id: crypto.randomUUID(),
      name: data.name.trim(),
      type: data.type,
      parentId: data.parentId,
      order: count + 1,
      isDeleted: false,
    })
  },

  async rename(id: string, name: string): Promise<void> {
    if (!name.trim()) throw new Error('Category name is required')
    await db.categories.update(id, { name: name.trim() })
  },

  async softDelete(id: string): Promise<void> {
    if (SYSTEM_IDS.has(id)) throw new Error('System categories cannot be deleted')
    const category = await db.categories.get(id)
    if (!category) throw new Error('Category not found')

    const fallbackId = category.type === 'income' ? '__general_income__' : '__uncategorized__'

    await db.transaction('rw', [db.categories, db.transactions], async () => {
      await db.categories.update(id, { isDeleted: true })
      await db.transactions
        .where('categoryId')
        .equals(id)
        .modify({ categoryId: fallbackId })
    })
  },
}
