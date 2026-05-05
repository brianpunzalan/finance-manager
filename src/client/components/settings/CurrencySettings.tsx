import { useShallow } from 'zustand/react/shallow'
import { useCurrencyStore } from '@/store/currencyStore'
import { useUiStore } from '@/store/uiStore'
import { Label } from '@/client/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select'

export function CurrencySettings() {
  const { currencies, defaultCurrency, setDefault } = useCurrencyStore(
    useShallow((s) => ({ currencies: s.currencies, defaultCurrency: s.defaultCurrency, setDefault: s.setDefault }))
  )
  const addToast = useUiStore((s) => s.addToast)

  async function handleChange(id: string) {
    try {
      await setDefault(id)
      addToast({ title: 'Default currency updated', variant: 'success' })
    } catch {
      addToast({ title: 'Failed to update currency', variant: 'destructive' })
    }
  }

  return (
    <section aria-labelledby="currency-heading" className="space-y-3">
      <h2 id="currency-heading" className="font-semibold">Currency</h2>
      <div>
        <Label htmlFor="currency-select">Default currency</Label>
        <Select value={defaultCurrency?.id ?? ''} onValueChange={handleChange}>
          <SelectTrigger id="currency-select" className="mt-1">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.symbol} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  )
}
