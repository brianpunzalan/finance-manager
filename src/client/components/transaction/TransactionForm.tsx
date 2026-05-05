import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import type { Transaction, TransactionType } from '@/shared/types'
import { useCategories } from '@/client/hooks/useCategories'
import { useAccounts } from '@/client/hooks/useAccounts'
import { useCurrencyStore } from '@/store/currencyStore'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Textarea } from '@/client/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select'

interface Props {
  initial?: Transaction
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => Promise<void>
  onCancel: () => void
}

const TYPES: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
]

export function TransactionForm({ initial, onSubmit, onCancel }: Props) {
  const { byType } = useCategories()
  const { accounts } = useAccounts()
  const defaultCurrency = useCurrencyStore((s) => s.defaultCurrency)

  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [accountId, setAccountId] = useState(initial?.accountId ?? '')
  const [fromAccountId, setFromAccountId] = useState(initial?.fromAccountId ?? '')
  const [toAccountId, setToAccountId] = useState(initial?.toAccountId ?? '')
  const [date, setDate] = useState(
    initial ? format(new Date(initial.date), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const availableCategories = byType(type === 'income' ? 'income' : 'expense')
  const availableAccounts = accounts.filter((a) => !a.isDeleted)

  // Reset category when type changes
  useEffect(() => {
    if (type === 'transfer') setCategoryId('')
  }, [type])

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Title is required'
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) errs.amount = 'Amount must be greater than zero'
    if (type !== 'transfer') {
      if (!categoryId) errs.categoryId = 'Category is required'
      if (!accountId) errs.accountId = 'Account is required'
    } else {
      if (!fromAccountId) errs.fromAccountId = 'Source account is required'
      if (!toAccountId) errs.toAccountId = 'Destination account is required'
      if (fromAccountId && toAccountId && fromAccountId === toAccountId)
        errs.toAccountId = 'Source and destination must be different'
    }
    if (!date) errs.date = 'Date is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit({
        type,
        title: title.trim(),
        amount: parseFloat(amount),
        note: note.trim() || undefined,
        categoryId: type !== 'transfer' ? categoryId : undefined,
        accountId: type !== 'transfer' ? accountId : undefined,
        fromAccountId: type === 'transfer' ? fromAccountId : undefined,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        currencyId: defaultCurrency?.id ?? 'PHP_PHP',
        date: new Date(date).getTime(),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const hasNoCategories = availableCategories.length === 0 && type !== 'transfer'
  const hasNoAccounts = availableAccounts.length === 0
  const hasOnlyOneAccountForTransfer = availableAccounts.length < 2 && type === 'transfer'
  const canSubmit = !submitting && !hasNoCategories && !hasNoAccounts && !hasOnlyOneAccountForTransfer

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Transaction form">
      {/* Type selector */}
      <div>
        <Label>Type</Label>
        <div className="mt-1 flex rounded-md border overflow-hidden" role="group" aria-label="Transaction type">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              aria-pressed={type === t.value}
              className={`flex-1 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                type === t.value
                  ? t.value === 'income'
                    ? 'bg-green-600 text-white'
                    : t.value === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="tx-title">Title *</Label>
        <Input
          id="tx-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Coffee, Salary"
          aria-required="true"
          aria-describedby={errors.title ? 'tx-title-error' : undefined}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && <p id="tx-title-error" className="mt-1 text-xs text-destructive">{errors.title}</p>}
      </div>

      {/* Amount */}
      <div>
        <Label htmlFor="tx-amount">Amount *</Label>
        <div className="relative">
          {defaultCurrency?.symbolPosition === 'prefix' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{defaultCurrency.symbol}</span>
          )}
          <Input
            id="tx-amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            aria-required="true"
            aria-describedby={errors.amount ? 'tx-amount-error' : undefined}
            className={`${defaultCurrency?.symbolPosition === 'prefix' ? 'pl-8' : ''} ${errors.amount ? 'border-destructive' : ''}`}
          />
        </div>
        {errors.amount && <p id="tx-amount-error" className="mt-1 text-xs text-destructive">{errors.amount}</p>}
      </div>

      {/* Category (income/expense only) */}
      {type !== 'transfer' && (
        <div>
          <Label htmlFor="tx-category">Category *</Label>
          {hasNoCategories ? (
            <p className="mt-1 text-sm text-muted-foreground">
              No categories yet. Add one in{' '}
              <a href="#/settings" className="underline text-primary">Settings → Categories</a>.
            </p>
          ) : (
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger
                id="tx-category"
                aria-required="true"
                aria-describedby={errors.categoryId ? 'tx-category-error' : undefined}
                className={errors.categoryId ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.categoryId && <p id="tx-category-error" className="mt-1 text-xs text-destructive">{errors.categoryId}</p>}
        </div>
      )}

      {/* Account (income/expense) */}
      {type !== 'transfer' && (
        <div>
          <Label htmlFor="tx-account">Account *</Label>
          {hasNoAccounts ? (
            <p className="mt-1 text-sm text-muted-foreground">
              No accounts yet. Add one in{' '}
              <a href="#/settings" className="underline text-primary">Settings → Accounts</a>.
            </p>
          ) : (
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger
                id="tx-account"
                aria-required="true"
                aria-describedby={errors.accountId ? 'tx-account-error' : undefined}
                className={errors.accountId ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {availableAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.accountId && <p id="tx-account-error" className="mt-1 text-xs text-destructive">{errors.accountId}</p>}
        </div>
      )}

      {/* Transfer accounts */}
      {type === 'transfer' && (
        <>
          {hasOnlyOneAccountForTransfer && (
            <p className="text-sm text-muted-foreground bg-muted rounded-md p-3">
              You need at least 2 accounts for a transfer.{' '}
              <a href="#/settings" className="underline text-primary">Add an account in Settings.</a>
            </p>
          )}
          <div>
            <Label htmlFor="tx-from">From Account *</Label>
            <Select value={fromAccountId} onValueChange={setFromAccountId}>
              <SelectTrigger
                id="tx-from"
                aria-describedby={errors.fromAccountId ? 'tx-from-error' : undefined}
                className={errors.fromAccountId ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Source account" />
              </SelectTrigger>
              <SelectContent>
                {availableAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fromAccountId && <p id="tx-from-error" className="mt-1 text-xs text-destructive">{errors.fromAccountId}</p>}
          </div>
          <div>
            <Label htmlFor="tx-to">To Account *</Label>
            <Select value={toAccountId} onValueChange={setToAccountId}>
              <SelectTrigger
                id="tx-to"
                aria-describedby={errors.toAccountId ? 'tx-to-error' : undefined}
                className={errors.toAccountId ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Destination account" />
              </SelectTrigger>
              <SelectContent>
                {availableAccounts
                  .filter((a) => a.id !== fromAccountId)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.toAccountId && <p id="tx-to-error" className="mt-1 text-xs text-destructive">{errors.toAccountId}</p>}
          </div>
        </>
      )}

      {/* Date */}
      <div>
        <Label htmlFor="tx-date">Date & Time *</Label>
        <Input
          id="tx-date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-required="true"
          className={errors.date ? 'border-destructive' : ''}
        />
        {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
      </div>

      {/* Note */}
      <div>
        <Label htmlFor="tx-note">Note <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Textarea
          id="tx-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Additional details…"
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={!canSubmit}>
          {submitting ? 'Saving…' : initial ? 'Update' : 'Add'}
        </Button>
      </div>
    </form>
  )
}
