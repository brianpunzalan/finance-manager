import { SettingsService } from '@/server/services/SettingsService'
import { CsvExporter } from './CsvExporter'
import { GoogleDriveService } from './GoogleDriveService'
import { useUiStore } from '@/store/uiStore'

const INTERVALS_MS: Record<string, number> = {
  daily: 86_400_000,
  weekly: 604_800_000,
  monthly: 2_592_000_000,
}

export const BackupScheduler = {
  async checkOnOpen(): Promise<void> {
    const settings = await SettingsService.get()
    if (!settings?.scheduledBackup.enabled) return
    if (!settings.scheduledBackup.googleDriveEnabled) return

    const { interval, lastBackupAt } = settings.scheduledBackup
    const intervalMs = INTERVALS_MS[interval] ?? INTERVALS_MS.weekly
    const now = Date.now()

    if (lastBackupAt && now - lastBackupAt < intervalMs) return

    try {
      const blob = await CsvExporter.exportToBlob()
      const filename = `finance-backup-${new Date().toISOString().slice(0, 10)}.fmbak.zip`
      await GoogleDriveService.uploadFile(blob, filename)
      await SettingsService.update({
        scheduledBackup: { ...settings.scheduledBackup, lastBackupAt: now },
      })
      useUiStore.getState().addToast({
        title: 'Backup saved',
        description: 'Your data was automatically backed up to Google Drive.',
        variant: 'success',
      })
    } catch (err) {
      console.error('Scheduled backup failed:', err)
    }
  },

  async registerPeriodicSync(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('periodicSync' in (await navigator.serviceWorker.ready))) return
    try {
      const reg = await navigator.serviceWorker.ready
      // @ts-expect-error — PeriodicSync not yet in TS lib
      await reg.periodicSync.register('finance-backup', { minInterval: 86_400_000 })
    } catch {
      // Not supported — on-open trigger is sole mechanism
    }
  },
}
