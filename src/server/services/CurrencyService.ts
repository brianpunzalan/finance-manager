import { db } from '@/server/db/db'
import type { Currency } from '@/shared/types'

export const CurrencyService = {
  async getAll(): Promise<Currency[]> {
    return db.currencies.toArray()
  },

  async getDefault(): Promise<Currency | undefined> {
    return db.currencies.filter((c) => c.isDefault).first()
  },

  async setDefault(id: string): Promise<void> {
    await db.transaction('rw', db.currencies, async () => {
      await db.currencies.toCollection().modify({ isDefault: false })
      await db.currencies.update(id, { isDefault: true })
    })
  },

  async add(currency: Omit<Currency, 'isDefault'>): Promise<void> {
    await db.currencies.add({ ...currency, isDefault: false })
  },
}
