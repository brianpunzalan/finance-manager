import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useCategories } from '@/client/hooks/useCategories'
import { useUiStore } from '@/store/uiStore'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select'
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

const SYSTEM_IDS = new Set(['__uncategorized__', '__general_income__'])

export function CategorySettings() {
  const { categories, addCategory, renameCategory, deleteCategory } = useCategories()
  const addToast = useUiStore((s) => s.addToast)

  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'income' | 'expense'>('expense')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  async function handleAdd() {
    try {
      await addCategory({ name: newName, type: newType })
      setNewName('')
      setAdding(false)
      addToast({ title: 'Category added', variant: 'success' })
    } catch (err) {
      addToast({ title: err instanceof Error ? err.message : 'Error', variant: 'destructive' })
    }
  }

  async function handleRename(id: string) {
    try {
      await renameCategory(id, editingName)
      setEditingId(null)
      addToast({ title: 'Category renamed', variant: 'success' })
    } catch (err) {
      addToast({ title: err instanceof Error ? err.message : 'Error', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id)
      addToast({ title: 'Category deleted', variant: 'default' })
    } catch (err) {
      addToast({ title: err instanceof Error ? err.message : 'Error', variant: 'destructive' })
    }
  }

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  function renderGroup(label: string, items: typeof categories) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase text-muted-foreground px-1">{label}</p>
        {items.map((c) => (
          <div key={c.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
            {editingId === c.id ? (
              <>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-7 flex-1 text-sm"
                  aria-label={`Rename ${c.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(c.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRename(c.id)} aria-label="Confirm rename">
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)} aria-label="Cancel rename">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{c.name}</span>
                {SYSTEM_IDS.has(c.id) && (
                  <span className="text-xs text-muted-foreground">system</span>
                )}
                {!SYSTEM_IDS.has(c.id) && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      aria-label={`Edit ${c.name}`}
                      onClick={() => { setEditingId(c.id); setEditingName(c.name) }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label={`Delete ${c.name}`}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete category?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Transactions in "{c.name}" will be moved to the system fallback category.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => handleDelete(c.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <section aria-labelledby="categories-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="categories-heading" className="font-semibold">Categories</h2>
        <Button size="sm" variant="outline" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {adding && (
        <div className="rounded-md border p-3 space-y-3">
          <div>
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Groceries"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="cat-type">Type</Label>
            <Select value={newType} onValueChange={(v) => setNewType(v as 'income' | 'expense')}>
              <SelectTrigger id="cat-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" className="flex-1" onClick={handleAdd}>Add Category</Button>
          </div>
        </div>
      )}

      {renderGroup('Income', incomeCategories)}
      {renderGroup('Expense', expenseCategories)}
    </section>
  )
}
