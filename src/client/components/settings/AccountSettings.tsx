import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useAccounts } from '@/client/hooks/useAccounts'
import { useCurrencyStore } from '@/store/currencyStore'
import { useUiStore } from '@/store/uiStore'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
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

const SYSTEM_IDS = new Set(['__general__'])

export function AccountSettings() {
  const { accounts, addAccount, renameAccount, deleteAccount } = useAccounts()
  const defaultCurrency = useCurrencyStore((s) => s.defaultCurrency)
  const addToast = useUiStore((s) => s.addToast)

  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  async function handleAdd() {
    try {
      await addAccount({ name: newName, currencyId: defaultCurrency?.id ?? 'PHP_PHP' })
      setNewName('')
      setAdding(false)
      addToast({ title: 'Account added', variant: 'success' })
    } catch (err) {
      addToast({ title: err instanceof Error ? err.message : 'Error', variant: 'destructive' })
    }
  }

  async function handleRename(id: string) {
    try {
      await renameAccount(id, editingName)
      setEditingId(null)
      addToast({ title: 'Account renamed', variant: 'success' })
    } catch (err) {
      addToast({ title: err instanceof Error ? err.message : 'Error', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAccount(id)
      addToast({ title: 'Account deleted', variant: 'default' })
    } catch (err) {
      addToast({ title: err instanceof Error ? err.message : 'Error', variant: 'destructive' })
    }
  }

  return (
    <section aria-labelledby="accounts-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="accounts-heading" className="font-semibold">Accounts</h2>
        <Button size="sm" variant="outline" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {adding && (
        <div className="rounded-md border p-3 space-y-3">
          <div>
            <Label htmlFor="acc-name">Name</Label>
            <Input
              id="acc-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. GCash, BPI"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" className="flex-1" onClick={handleAdd}>Add Account</Button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {accounts.map((a) => (
          <div key={a.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
            {editingId === a.id ? (
              <>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-7 flex-1 text-sm"
                  aria-label={`Rename ${a.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(a.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRename(a.id)} aria-label="Confirm rename">
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)} aria-label="Cancel rename">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{a.name}</span>
                {SYSTEM_IDS.has(a.id) && <span className="text-xs text-muted-foreground">system</span>}
                {!SYSTEM_IDS.has(a.id) && (
                  <>
                    <Button size="icon" variant="ghost" className="h-7 w-7" aria-label={`Edit ${a.name}`}
                      onClick={() => { setEditingId(a.id); setEditingName(a.name) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label={`Delete ${a.name}`}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Transactions in "{a.name}" will be moved to the General fallback account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handleDelete(a.id)}>
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
    </section>
  )
}
