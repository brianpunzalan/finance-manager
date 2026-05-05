import './browser-guard'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { runSeedIfNeeded } from './server/db/migrations'
import { useUiStore } from './store/uiStore'
import { useCurrencyStore } from './store/currencyStore'
import { useSettingsStore } from './store/settingsStore'
import { useCategoryStore } from './store/categoryStore'
import { useAccountStore } from './store/accountStore'
import { requestStoragePersistence } from './server/pwa/StoragePersistence'
import { initInstallPrompt } from './server/pwa/InstallPrompt'
import { BackupScheduler } from './server/backup/BackupScheduler'

async function boot() {
  // Connectivity listeners
  const { setOnline } = useUiStore.getState()
  window.addEventListener('online', () => setOnline(true))
  window.addEventListener('offline', () => setOnline(false))

  // Capture install prompt early
  initInstallPrompt()

  try {
    await runSeedIfNeeded()
    await Promise.all([
      useCurrencyStore.getState().load(),
      useSettingsStore.getState().load(),
      useCategoryStore.getState().load(),
      useAccountStore.getState().load(),
    ])
  } catch (err) {
    useUiStore.getState().setDbError(
      err instanceof Error ? err.message : 'Database failed to initialize'
    )
  }

  // Request persistent storage (non-blocking)
  requestStoragePersistence().then((granted) => {
    if (!granted) {
      useUiStore.getState().setStoragePermissionGranted(false)
    } else {
      useUiStore.getState().setStoragePermissionGranted(true)
    }
  })

  // Scheduled backup check on open
  BackupScheduler.checkOnOpen().catch(() => {
    // non-fatal
  })

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

boot()
