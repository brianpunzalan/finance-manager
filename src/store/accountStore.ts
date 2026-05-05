import { create } from 'zustand'
import type { Account, AccountGroup } from '@/shared/types'
import { AccountService } from '@/server/services/AccountService'

interface AccountState {
  accounts: Account[]
  groups: AccountGroup[]
  isLoaded: boolean
}

interface AccountActions {
  load: () => Promise<void>
  addAccount: (data: { name: string; groupId?: string; currencyId: string }) => Promise<void>
  renameAccount: (id: string, name: string) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
}

export const useAccountStore = create<AccountState & AccountActions>((set, get) => ({
  accounts: [],
  groups: [],
  isLoaded: false,

  load: async () => {
    const [accounts, groups] = await Promise.all([
      AccountService.getAll(),
      AccountService.getGroups(),
    ])
    set({ accounts, groups, isLoaded: true })
  },

  addAccount: async (data) => {
    await AccountService.add(data)
    await get().load()
  },

  renameAccount: async (id, name) => {
    await AccountService.rename(id, name)
    await get().load()
  },

  deleteAccount: async (id) => {
    await AccountService.softDelete(id)
    await get().load()
  },
}))
