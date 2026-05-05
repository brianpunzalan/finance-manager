import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import type { Transaction } from '@/shared/types'
import { useTransactions } from '@/client/hooks/useTransactions'
import { useCategories } from '@/client/hooks/useCategories'
import { useAccounts } from '@/client/hooks/useAccounts'
import { useUiStore } from '@/store/uiStore'
import { TransactionForm } from '@/client/components/transaction/TransactionForm'
import { TransactionList } from '@/client/components/transaction/TransactionList'
import { FilterBar } from '@/client/components/transaction/FilterBar'
import { TopBar } from '@/client/components/layout/TopBar'
import { Button } from '@/client/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/client/components/ui/dialog'

export default function TransactionsPage() {
  const { load, addTransaction, updateTransaction } = useTransactions()
  const { load: loadCategories } = useCategories()
  const { load: loadAccounts } = useAccounts()
  const addToast = useUiStore((s) => s.addToast)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | undefined>()

  useEffect(() => {
    load()
    loadCategories()
    loadAccounts()
  }, [load, loadCategories, loadAccounts])

  async function handleSubmit(data: Parameters<typeof addTransaction>[0]) {
    try {
      if (editing) {
        await updateTransaction(editing.id, data)
        addToast({ title: 'Transaction updated', variant: 'success' })
      } else {
        await addTransaction(data)
        addToast({ title: 'Transaction added', variant: 'success' })
      }
      setOpen(false)
      setEditing(undefined)
    } catch (err) {
      addToast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save',
        variant: 'destructive',
      })
    }
  }

  function handleEdit(tx: Transaction) {
    setEditing(tx)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setEditing(undefined)
  }

  return (
    <>
      <TopBar
        title="Transactions"
        action={
          <Button size="sm" onClick={() => setOpen(true)} aria-label="Add transaction">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        }
      />

      <FilterBar />
      <TransactionList onEdit={handleEdit} />

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
          </DialogHeader>
          <TransactionForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
