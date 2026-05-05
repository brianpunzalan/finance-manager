import type { Transaction } from '@/shared/types'
import { useTransactions } from '@/client/hooks/useTransactions'
import { useCategories } from '@/client/hooks/useCategories'
import { useAccounts } from '@/client/hooks/useAccounts'
import { useUiStore } from '@/store/uiStore'
import { TransactionItem } from './TransactionItem'
import { EmptyState } from '@/client/components/shared/EmptyState'
import { LoadingSpinner } from '@/client/components/shared/LoadingSpinner'

interface Props {
  onEdit: (tx: Transaction) => void
}

export function TransactionList({ onEdit }: Props) {
  const { transactions, isLoaded, filters, deleteTransaction, clearFilters } = useTransactions()
  const { categories } = useCategories()
  const { accounts } = useAccounts()
  const addToast = useUiStore((s) => s.addToast)

  const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== undefined)

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id)
      addToast({ title: 'Transaction deleted', variant: 'default' })
    } catch (err) {
      addToast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete',
        variant: 'destructive',
      })
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  if (transactions.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        title="No results"
        description="No transactions match the current filters."
        action={
          <button
            onClick={clearFilters}
            className="text-sm text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Clear filters
          </button>
        }
      />
    ) : (
      <EmptyState
        title="No transactions yet"
        description="Tap Add to record your first transaction."
      />
    )
  }

  return (
    <div role="list" aria-label="Transaction list">
      {transactions.map((tx) => (
        <div key={tx.id} role="listitem">
          <TransactionItem
            transaction={tx}
            categories={categories}
            accounts={accounts}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
          <hr className="border-border mx-4" />
        </div>
      ))}
    </div>
  )
}
