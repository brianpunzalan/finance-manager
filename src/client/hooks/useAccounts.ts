import { useShallow } from "zustand/react/shallow";
import { useAccountStore } from "@/store/accountStore";

export function useAccounts() {
  const accounts = useAccountStore(useShallow((s) => s.accounts));
  const groups = useAccountStore(useShallow((s) => s.groups));
  const isLoaded = useAccountStore(useShallow((s) => s.isLoaded));
  const load = useAccountStore(useShallow((s) => s.load));
  const addAccount = useAccountStore(useShallow((s) => s.addAccount));
  const renameAccount = useAccountStore(useShallow((s) => s.renameAccount));
  const deleteAccount = useAccountStore(useShallow((s) => s.deleteAccount));

  return {
    accounts,
    groups,
    isLoaded,
    load,
    addAccount,
    renameAccount,
    deleteAccount,
  };
}
