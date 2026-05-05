import { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useTransactions } from '@/client/hooks/useTransactions'
import { useCategories } from '@/client/hooks/useCategories'
import { useAccounts } from '@/client/hooks/useAccounts'
import type { TransactionFilters, TransactionType } from '@/shared/types'
import { Input } from '@/client/components/ui/input'
import { Button } from '@/client/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select'

export function FilterBar() {
  const { filters, setFilters, clearFilters } = useTransactions()
  const { categories } = useCategories()
  const { accounts } = useAccounts()
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== undefined)

  function update(patch: Partial<TransactionFilters>) {
    setFilters({ ...filters, ...patch })
  }

  return (
    <div className="border-b">
      {/* Search row */}
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search transactions…"
            value={filters.search ?? ''}
            onChange={(e) => update({ search: e.target.value || undefined })}
            className="pl-9 h-9"
            aria-label="Search transactions"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={clearFilters}
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter row */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {/* Type */}
          <Select
            value={filters.type ?? ''}
            onValueChange={(v) => update({ type: (v as TransactionType) || undefined })}
          >
            <SelectTrigger className="h-8 w-[120px] text-xs" aria-label="Filter by type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>

          {/* Account */}
          <Select
            value={filters.accountId ?? ''}
            onValueChange={(v) => update({ accountId: v || undefined })}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs" aria-label="Filter by account">
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All accounts</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category */}
          <Select
            value={filters.categoryId ?? ''}
            onValueChange={(v) => update({ categoryId: v || undefined })}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs" aria-label="Filter by category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date from */}
          <Input
            type="date"
            value={filters.dateFrom ? new Date(filters.dateFrom).toISOString().slice(0, 10) : ''}
            onChange={(e) => update({ dateFrom: e.target.value ? new Date(e.target.value).getTime() : undefined })}
            className="h-8 w-[130px] text-xs"
            aria-label="From date"
          />

          {/* Date to */}
          <Input
            type="date"
            value={filters.dateTo ? new Date(filters.dateTo).toISOString().slice(0, 10) : ''}
            onChange={(e) => update({ dateTo: e.target.value ? new Date(e.target.value + 'T23:59:59').getTime() : undefined })}
            className="h-8 w-[130px] text-xs"
            aria-label="To date"
          />
        </div>
      )}
    </div>
  )
}
