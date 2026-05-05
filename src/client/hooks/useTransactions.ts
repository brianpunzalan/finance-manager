import { useTransactionStore, selectFilteredTransactions } from '@/store/transactionStore'

export function useTransactions() {
  const filtered = useTransactionStore(selectFilteredTransactions)
  const isLoaded = useTransactionStore((s) => s.isLoaded)
  const filters = useTransactionStore((s) => s.filters)
  const load = useTransactionStore((s) => s.load)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const updateTransaction = useTransactionStore((s) => s.updateTransaction)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const setFilters = useTransactionStore((s) => s.setFilters)
  const clearFilters = useTransactionStore((s) => s.clearFilters)

  return {
    transactions: filtered,
    isLoaded,
    filters,
    load,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    clearFilters,
  }
}
