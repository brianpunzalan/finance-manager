import { useShallow } from 'zustand/react/shallow'
import { useAccountStore } from '@/store/accountStore'

export function useAccounts() {
  return useAccountStore(
    useShallow((s) => ({
      accounts: s.accounts,
      groups: s.groups,
      isLoaded: s.isLoaded,
      load: s.load,
      addAccount: s.addAccount,
      renameAccount: s.renameAccount,
      deleteAccount: s.deleteAccount,
    }))
  )
}
