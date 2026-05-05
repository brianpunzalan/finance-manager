import { create } from 'zustand'
import type { ToastItem } from '@/shared/types'

interface UiState {
  isOnline: boolean
  dbError: string | null
  installPromptEvent: BeforeInstallPromptEvent | null
  installPromptAvailable: boolean
  storagePermissionGranted: boolean | null
  toasts: ToastItem[]
}

interface UiActions {
  setOnline: (online: boolean) => void
  setDbError: (error: string | null) => void
  setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) => void
  setStoragePermissionGranted: (granted: boolean) => void
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: ReadonlyArray<string>
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
    prompt(): Promise<void>
  }
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export const useUiStore = create<UiState & UiActions>((set) => ({
  isOnline: navigator.onLine,
  dbError: null,
  installPromptEvent: null,
  installPromptAvailable: false,
  storagePermissionGranted: null,
  toasts: [],

  setOnline: (online) => set({ isOnline: online }),
  setDbError: (error) => set({ dbError: error }),
  setInstallPromptEvent: (event) =>
    set({ installPromptEvent: event, installPromptAvailable: event !== null }),
  setStoragePermissionGranted: (granted) => set({ storagePermissionGranted: granted }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
