import { useShallow } from 'zustand/react/shallow'
import { useTransactionStore, selectFilteredTransactions } from '@/store/transactionStore'

export function useTransactions() {
  return useTransactionStore(
    useShallow((s) => ({
      transactions: selectFilteredTransactions(s),
      isLoaded: s.isLoaded,
      filters: s.filters,
      load: s.load,
      addTransaction: s.addTransaction,
      updateTransaction: s.updateTransaction,
      deleteTransaction: s.deleteTransaction,
      setFilters: s.setFilters,
      clearFilters: s.clearFilters,
    }))
  )
}
