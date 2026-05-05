import { format } from 'date-fns'
import { ArrowRight, Pencil, Trash2 } from 'lucide-react'
import type { Transaction, Category, Account } from '@/shared/types'
import { Badge } from '@/client/components/ui/badge'
import { Button } from '@/client/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/client/components/ui/alert-dialog'

interface Props {
  transaction: Transaction
  categories: Category[]
  accounts: Account[]
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionItem({ transaction: tx, categories, accounts, onEdit, onDelete }: Props) {
  const category = categories.find((c) => c.id === tx.categoryId)
  const account = accounts.find((a) => a.id === tx.accountId)
  const fromAccount = accounts.find((a) => a.id === tx.fromAccountId)
  const toAccount = accounts.find((a) => a.id === tx.toAccountId)

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
      {/* Type badge */}
      <div className="pt-0.5 shrink-0">
        <Badge variant={tx.type}>{tx.type[0].toUpperCase()}</Badge>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-sm">{tx.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {tx.type === 'transfer' ? (
            <span className="flex items-center gap-1">
              <span className="truncate max-w-[80px]">{fromAccount?.name ?? '—'}</span>
              <ArrowRight className="h-3 w-3 shrink-0" aria-label="to" />
              <span className="truncate max-w-[80px]">{toAccount?.name ?? '—'}</span>
            </span>
          ) : (
            <span>
              {category?.name ?? '—'} · {account?.name ?? '—'}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'MMM d, yyyy · h:mm a')}</p>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p
          className={`font-semibold text-sm ${
            tx.type === 'income'
              ? 'text-green-600'
              : tx.type === 'expense'
              ? 'text-red-600'
              : 'text-blue-600'
          }`}
        >
          {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
          {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${tx.title}`}
          onClick={() => onEdit(tx)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Delete ${tx.title}`}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                "{tx.title}" will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(tx.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
