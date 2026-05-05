import { useAccountStore } from '@/store/accountStore'

export function useAccounts() {
  const accounts = useAccountStore((s) => s.accounts)
  const groups = useAccountStore((s) => s.groups)
  const isLoaded = useAccountStore((s) => s.isLoaded)
  const load = useAccountStore((s) => s.load)
  const addAccount = useAccountStore((s) => s.addAccount)
  const renameAccount = useAccountStore((s) => s.renameAccount)
  const deleteAccount = useAccountStore((s) => s.deleteAccount)

  return { accounts, groups, isLoaded, load, addAccount, renameAccount, deleteAccount }
}
