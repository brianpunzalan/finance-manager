import { useEffect } from 'react'
import { useCategories } from '@/client/hooks/useCategories'
import { useAccounts } from '@/client/hooks/useAccounts'
import { useCurrencyStore } from '@/store/currencyStore'
import { TopBar } from '@/client/components/layout/TopBar'
import { CategorySettings } from '@/client/components/settings/CategorySettings'
import { AccountSettings } from '@/client/components/settings/AccountSettings'
import { CurrencySettings } from '@/client/components/settings/CurrencySettings'
import { BackupSettings } from '@/client/components/settings/BackupSettings'
import { Separator } from '@/client/components/ui/separator'

export default function SettingsPage() {
  const { load: loadCategories } = useCategories()
  const { load: loadAccounts } = useAccounts()
  const loadCurrencies = useCurrencyStore((s) => s.load)

  useEffect(() => {
    loadCategories()
    loadAccounts()
    loadCurrencies()
  }, [loadCategories, loadAccounts, loadCurrencies])

  return (
    <>
      <TopBar title="Settings" />
      <div className="px-4 py-6 space-y-8 max-w-lg mx-auto">
        <CurrencySettings />
        <Separator />
        <CategorySettings />
        <Separator />
        <AccountSettings />
        <Separator />
        <BackupSettings />
      </div>
    </>
  )
}
