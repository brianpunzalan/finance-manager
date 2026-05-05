import { useUiStore } from '@/store/uiStore'
import type { ToastItem } from '@/shared/types'

export function useToast() {
  const toasts = useUiStore((s) => s.toasts)
  const addToast = useUiStore((s) => s.addToast)
  const removeToast = useUiStore((s) => s.removeToast)

  function toast(opts: Omit<ToastItem, 'id'>) {
    addToast(opts)
  }

  return { toasts, toast, removeToast }
}
