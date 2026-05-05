import { useShallow } from "zustand/react/shallow";
import {
  useTransactionStore,
  selectFilteredTransactions,
} from "@/store/transactionStore";

export function useTransactions() {
  const transactions = useTransactionStore(
    useShallow((s) => selectFilteredTransactions(s)),
  );
  const isLoaded = useTransactionStore(useShallow((s) => s.isLoaded));
  const filters = useTransactionStore(useShallow((s) => s.filters));
  const load = useTransactionStore(useShallow((s) => s.load));
  const addTransaction = useTransactionStore(
    useShallow((s) => s.addTransaction),
  );
  const updateTransaction = useTransactionStore(
    useShallow((s) => s.updateTransaction),
  );
  const deleteTransaction = useTransactionStore(
    useShallow((s) => s.deleteTransaction),
  );
  const setFilters = useTransactionStore(useShallow((s) => s.setFilters));
  const clearFilters = useTransactionStore(useShallow((s) => s.clearFilters));

  return {
    transactions,
    isLoaded,
    filters,
    load,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    clearFilters,
  };
}
