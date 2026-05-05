import { useRef, useState } from 'react'
import { Download, CloudUpload, RefreshCw, FileArchive } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { useUiStore } from '@/store/uiStore'
import { CsvExporter } from '@/server/backup/CsvExporter'
import { CsvImporter, type ImportPreview } from '@/server/backup/CsvImporter'
import { MmbakImporter } from '@/server/backup/MmbakImporter'
import { GoogleDriveService } from '@/server/backup/GoogleDriveService'
import { Button } from '@/client/components/ui/button'
import { Switch } from '@/client/components/ui/switch'
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
} from '@/client/components/ui/alert-dialog'

export function BackupSettings() {
  const settings = useSettingsStore((s) => s.settings)
  const updateBackup = useSettingsStore((s) => s.updateBackupSettings)
  const addToast = useUiStore((s) => s.addToast)

  const restoreRef = useRef<HTMLInputElement>(null)
  const mmbakRef = useRef<HTMLInputElement>(null)

  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const backup = settings?.scheduledBackup

  async function handleLocalExport() {
    setBusy(true)
    try {
      const count = await CsvExporter.exportAndDownload()
      addToast({ title: 'Export complete', description: `${count} transactions downloaded`, variant: 'success' })
    } catch (err) {
      addToast({ title: 'Export failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  async function handleDriveExport() {
    if (!GoogleDriveService.isConfigured()) {
      addToast({ title: 'Google Drive not configured', description: 'VITE_GOOGLE_CLIENT_ID is not set.', variant: 'destructive' })
      return
    }
    setBusy(true)
    try {
      const blob = await CsvExporter.exportToBlob()
      const filename = `finance-backup-${new Date().toISOString().slice(0, 10)}.fmbak.zip`
      await GoogleDriveService.uploadFile(blob, filename)
      addToast({ title: 'Saved to Google Drive', variant: 'success' })
    } catch (err) {
      addToast({ title: 'Drive export failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  async function handleRestoreFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const p = await CsvImporter.preview(file)
      setPreview(p)
      setPendingFile(file)
      setConfirmOpen(true)
    } catch (err) {
      addToast({ title: 'Invalid backup file', description: err instanceof Error ? err.message : 'File rejected', variant: 'destructive' })
    }
  }

  async function handleConfirmRestore() {
    if (!pendingFile) return
    setConfirmOpen(false)
    setBusy(true)
    try {
      const result = await CsvImporter.restore(pendingFile)
      addToast({ title: 'Restore complete', description: `${result.transactionCount} transactions restored`, variant: 'success' })
      window.location.reload()
    } catch (err) {
      addToast({ title: 'Restore failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setBusy(false)
      setPendingFile(null)
      setPreview(null)
    }
  }

  async function handleMmbakChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setBusy(true)
    try {
      const result = await MmbakImporter.import(file)
      addToast({ title: 'Import complete', description: `${result.transactionCount} transactions imported from .mmbak`, variant: 'success' })
      window.location.reload()
    } catch (err) {
      addToast({ title: 'Import failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="backup-heading" className="space-y-5">
      <h2 id="backup-heading" className="font-semibold">Backup & Export</h2>

      {/* Manual export */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Export now</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={handleLocalExport}>
            <Download className="h-4 w-4 mr-1" />
            Download to device
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={handleDriveExport}>
            <CloudUpload className="h-4 w-4 mr-1" />
            Save to Google Drive
          </Button>
        </div>
      </div>

      {/* Scheduled backup */}
      {backup && (
        <div className="space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="backup-enabled" className="font-medium">Scheduled backup</Label>
            <Switch
              id="backup-enabled"
              checked={backup.enabled}
              onCheckedChange={(v) => updateBackup({ enabled: v })}
              aria-label="Enable scheduled backup"
            />
          </div>
          {backup.enabled && (
            <>
              <div>
                <Label htmlFor="backup-interval">Interval</Label>
                <Select
                  value={backup.interval}
                  onValueChange={(v) => updateBackup({ interval: v as typeof backup.interval })}
                >
                  <SelectTrigger id="backup-interval" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="drive-enabled" className="text-sm">Use Google Drive</Label>
                <Switch
                  id="drive-enabled"
                  checked={backup.googleDriveEnabled}
                  onCheckedChange={(v) => updateBackup({ googleDriveEnabled: v })}
                />
              </div>
              {backup.lastBackupAt && (
                <p className="text-xs text-muted-foreground">
                  Last backup: {new Date(backup.lastBackupAt).toLocaleDateString()}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Restore */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Restore from backup</p>
        <input
          ref={restoreRef}
          type="file"
          accept=".zip,.fmbak.zip"
          className="hidden"
          onChange={handleRestoreFileChange}
          aria-label="Select backup file"
        />
        <Button variant="outline" size="sm" disabled={busy} onClick={() => restoreRef.current?.click()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Restore from .fmbak.zip
        </Button>
      </div>

      {/* .mmbak import */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Import from MoneyManager</p>
        <input
          ref={mmbakRef}
          type="file"
          accept=".mmbak"
          className="hidden"
          onChange={handleMmbakChange}
          aria-label="Select .mmbak file"
        />
        <Button variant="outline" size="sm" disabled={busy} onClick={() => mmbakRef.current?.click()}>
          <FileArchive className="h-4 w-4 mr-1" />
          Import .mmbak
        </Button>
      </div>

      {/* Confirm restore dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore backup?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>This will replace all existing data with:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>{preview?.transactionCount ?? 0} transactions</li>
                  <li>{preview?.categoryCount ?? 0} categories</li>
                  <li>{preview?.accountCount ?? 0} accounts</li>
                </ul>
                <p className="font-medium text-destructive">Your current data will be permanently replaced.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingFile(null); setPreview(null) }}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleConfirmRestore}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
