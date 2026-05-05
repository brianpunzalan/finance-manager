import { create } from 'zustand'
import type { Transaction, TransactionFilters } from '@/shared/types'
import { TransactionService } from '@/server/services/TransactionService'

type NewTransaction = Parameters<typeof TransactionService.add>[0]

interface TransactionState {
  transactions: Transaction[]
  filters: TransactionFilters
  isLoaded: boolean
}

interface TransactionActions {
  load: () => Promise<void>
  addTransaction: (data: NewTransaction) => Promise<Transaction>
  updateTransaction: (id: string, patch: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  setFilters: (filters: TransactionFilters) => void
  clearFilters: () => void
}

export const useTransactionStore = create<TransactionState & TransactionActions>((set, get) => ({
  transactions: [],
  filters: {},
  isLoaded: false,

  load: async () => {
    const transactions = await TransactionService.getAll()
    set({ transactions, isLoaded: true })
  },

  addTransaction: async (data) => {
    const tx = await TransactionService.add(data)
    await get().load()
    return tx
  },

  updateTransaction: async (id, patch) => {
    await TransactionService.update(id, patch)
    await get().load()
  },

  deleteTransaction: async (id) => {
    await TransactionService.softDelete(id)
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }))
  },

  setFilters: (filters) => set({ filters }),

  clearFilters: () => set({ filters: {} }),
}))

export function selectFilteredTransactions(state: TransactionState): Transaction[] {
  const { transactions, filters } = state
  return transactions.filter((t) => {
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
}
