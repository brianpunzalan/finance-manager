import { db } from '@/server/db/db'
import type { AppSettings } from '@/shared/types'

export const SettingsService = {
  async get(): Promise<AppSettings | undefined> {
    return db.settings.get('singleton')
  },

  async update(patch: Partial<Omit<AppSettings, 'key'>>): Promise<void> {
    await db.settings.update('singleton', patch)
  },
}
