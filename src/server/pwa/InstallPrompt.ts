import { useUiStore } from '@/store/uiStore'

let deferred: BeforeInstallPromptEvent | null = null

export function initInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e
    useUiStore.getState().setInstallPromptEvent(e)
  })

  window.addEventListener('appinstalled', () => {
    deferred = null
    useUiStore.getState().setInstallPromptEvent(null)
  })
}

export async function showInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable'
  await deferred.prompt()
  const { outcome } = await deferred.userChoice
  deferred = null
  useUiStore.getState().setInstallPromptEvent(null)
  return outcome
}
