import { SettingsService } from '@/server/services/SettingsService'

export async function requestStoragePersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  const granted = await navigator.storage.persist()
  try {
    await SettingsService.update({ storagePermissionGranted: granted })
  } catch {
    // non-fatal
  }
  return granted
}
