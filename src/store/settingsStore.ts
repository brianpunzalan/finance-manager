import { create } from 'zustand'
import type { AppSettings, ScheduledBackup } from '@/shared/types'
import { SettingsService } from '@/server/services/SettingsService'

interface SettingsState {
  settings: AppSettings | null
  isLoaded: boolean
}

interface SettingsActions {
  load: () => Promise<void>
  update: (patch: Partial<Omit<AppSettings, 'key'>>) => Promise<void>
  updateBackupSettings: (patch: Partial<ScheduledBackup>) => Promise<void>
}

export const useSettingsStore = create<SettingsState & SettingsActions>((set, get) => ({
  settings: null,
  isLoaded: false,

  load: async () => {
    const settings = await SettingsService.get()
    set({ settings: settings ?? null, isLoaded: true })
  },

  update: async (patch) => {
    await SettingsService.update(patch)
    const settings = await SettingsService.get()
    set({ settings: settings ?? null })
  },

  updateBackupSettings: async (patch) => {
    const current = get().settings
    if (!current) return
    const updatedBackup = { ...current.scheduledBackup, ...patch }
    await SettingsService.update({ scheduledBackup: updatedBackup })
    const settings = await SettingsService.get()
    set({ settings: settings ?? null })
  },
}))
