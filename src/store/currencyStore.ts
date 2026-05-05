import { create } from 'zustand'
import type { Currency } from '@/shared/types'
import { CurrencyService } from '@/server/services/CurrencyService'

interface CurrencyState {
  currencies: Currency[]
  defaultCurrency: Currency | null
  isLoaded: boolean
}

interface CurrencyActions {
  load: () => Promise<void>
  setDefault: (id: string) => Promise<void>
  addCurrency: (currency: Omit<Currency, 'isDefault'>) => Promise<void>
}

export const useCurrencyStore = create<CurrencyState & CurrencyActions>((set) => ({
  currencies: [],
  defaultCurrency: null,
  isLoaded: false,

  load: async () => {
    const currencies = await CurrencyService.getAll()
    const defaultCurrency = currencies.find((c) => c.isDefault) ?? null
    set({ currencies, defaultCurrency, isLoaded: true })
  },

  setDefault: async (id) => {
    await CurrencyService.setDefault(id)
    const currencies = await CurrencyService.getAll()
    const defaultCurrency = currencies.find((c) => c.isDefault) ?? null
    set({ currencies, defaultCurrency })
  },

  addCurrency: async (currency) => {
    await CurrencyService.add(currency)
    const currencies = await CurrencyService.getAll()
    set({ currencies })
  },
}))
