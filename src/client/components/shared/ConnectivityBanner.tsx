import { WifiOff } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'

export function ConnectivityBanner() {
  const isOnline = useUiStore((s) => s.isOnline)
  if (isOnline) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 bg-yellow-50 px-4 py-2 text-sm text-yellow-800 border-b border-yellow-200"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>You're offline — all data is saved on your device.</span>
    </div>
  )
}
