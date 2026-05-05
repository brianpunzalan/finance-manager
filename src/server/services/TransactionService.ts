import { db } from '@/server/db/db'
import type { Transaction, TransactionFilters } from '@/shared/types'

type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>

function validate(data: NewTransaction | Transaction): void {
  if (!data.title.trim()) throw new Error('Title is required')
  if (data.amount <= 0) throw new Error('Amount must be greater than zero')

  if (data.type === 'income' || data.type === 'expense') {
    if (!data.accountId) throw new Error('Account is required')
    if (!data.categoryId) throw new Error('Category is required')
  }

  if (data.type === 'transfer') {
    if (!data.fromAccountId) throw new Error('Source account is required')
    if (!data.toAccountId) throw new Error('Destination account is required')
    if (data.fromAccountId === data.toAccountId)
      throw new Error('Source and destination accounts must be different')
  }
}

export const TransactionService = {
  async add(data: NewTransaction): Promise<Transaction> {
    validate(data)
    const now = Date.now()
    const tx: Transaction = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    }
    await db.transaction('rw', db.transactions, async () => {
      await db.transactions.add(tx)
    })
    return tx
  },

  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    let collection = db.transactions.filter((t) => !t.isDeleted)

    const results = await collection.toArray()

    return results
      .filter((t) => {
        if (!filters) return true
        if (filters.type && t.type !== filters.type) return false
        if (filters.accountId) {
          const match =
            t.accountId === filters.accountId ||
            t.fromAccountId === filters.accountId ||
            t.toAccountId === filters.accountId
          if (!match) return false
        }
        if (filters.categoryId && t.categoryId !== filters.categoryId) return false
        if (filters.dateFrom && t.date < filters.dateFrom) return false
        if (filters.dateTo && t.date > filters.dateTo) return false
        if (filters.search) {
          const q = filters.search.toLowerCase()
          if (!t.title.toLowerCase().includes(q) && !(t.note ?? '').toLowerCase().includes(q))
            return false
        }
        return true
      })
      .sort((a, b) => b.date - a.date)
  },

  async update(id: string, patch: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<void> {
    const existing = await db.transactions.get(id)
    if (!existing) throw new Error('Transaction not found')
    const updated = { ...existing, ...patch, updatedAt: Date.now() }
    validate(updated as NewTransaction)
    await db.transaction('rw', db.transactions, async () => {
      await db.transactions.put(updated)
    })
  },

  async softDelete(id: string): Promise<void> {
    await db.transaction('rw', db.transactions, async () => {
      await db.transactions.update(id, { isDeleted: true, updatedAt: Date.now() })
    })
  },
}
