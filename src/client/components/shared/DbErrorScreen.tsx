import { useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { CsvImporter } from '@/server/backup/CsvImporter'
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

export function DbErrorScreen() {
  const dbError = useUiStore((s) => s.dbError)
  const addToast = useUiStore((s) => s.addToast)
  const restoreRef = useRef<HTMLInputElement>(null)

  if (!dbError) return null

  async function handleRestoreChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await CsvImporter.restore(file)
      addToast({ title: 'Restore complete', description: `${result.transactionCount} transactions restored`, variant: 'success' })
      window.location.reload()
    } catch (err) {
      addToast({ title: 'Restore failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' })
    }
  }

  async function handleStartFresh() {
    const dbs = await indexedDB.databases?.()
    if (dbs) {
      for (const d of dbs) {
        if (d.name) indexedDB.deleteDatabase(d.name)
      }
    }
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full space-y-5 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" aria-hidden="true" />
        <h1 className="text-xl font-bold">Database Error</h1>
        <p className="text-sm text-muted-foreground">
          Finance Manager couldn't read your data. Further writes are blocked to protect your records.
        </p>
        <p className="text-xs font-mono text-muted-foreground bg-muted rounded p-2 break-all">{dbError}</p>

        <div className="space-y-3">
          <input
            ref={restoreRef}
            type="file"
            accept=".zip,.fmbak.zip"
            className="hidden"
            onChange={handleRestoreChange}
            aria-label="Select backup file to restore"
          />
          <Button className="w-full" onClick={() => restoreRef.current?.click()}>
            Restore from backup
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">Start fresh</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently erase everything. There is no undo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground">
                      Yes, I understand
                    </AlertDialogAction>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        All financial records will be permanently deleted. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground"
                        onClick={handleStartFresh}
                      >
                        Delete everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
