import { db } from './db'
import type { Category, Account, AccountGroup, Currency, AppSettings } from '@/shared/types'

const SCHEMA_VERSION = 1

const DEFAULT_CURRENCY: Currency = {
  id: 'PHP_PHP',
  name: 'PHP - Philippines (₱)',
  isoCode: 'PHP',
  symbol: '₱',
  symbolPosition: 'prefix',
  decimalPlaces: 2,
  isDefault: true,
}

const SEED_CATEGORIES: Category[] = [
  // System fallbacks — never deletable
  { id: '__uncategorized__', name: 'Uncategorized', type: 'expense', order: 0, isDeleted: false },
  { id: '__general_income__', name: 'General Income', type: 'income', order: 0, isDeleted: false },
  // Expense presets
  { id: 'cat-food', name: '🍜 Food & Drink', type: 'expense', order: 1, isDeleted: false },
  { id: 'cat-transport', name: '🚌 Transport', type: 'expense', order: 2, isDeleted: false },
  { id: 'cat-shopping', name: '🛍️ Shopping', type: 'expense', order: 3, isDeleted: false },
  { id: 'cat-bills', name: '💡 Bills & Utilities', type: 'expense', order: 4, isDeleted: false },
  { id: 'cat-health', name: '🏥 Health & Medical', type: 'expense', order: 5, isDeleted: false },
  { id: 'cat-housing', name: '🏠 Housing & Rent', type: 'expense', order: 6, isDeleted: false },
  { id: 'cat-entertainment', name: '🎮 Entertainment', type: 'expense', order: 7, isDeleted: false },
  { id: 'cat-education', name: '📚 Education', type: 'expense', order: 8, isDeleted: false },
  { id: 'cat-personal', name: '💆 Personal Care', type: 'expense', order: 9, isDeleted: false },
  { id: 'cat-travel', name: '✈️ Travel', type: 'expense', order: 10, isDeleted: false },
  // Income presets
  { id: 'cat-salary', name: '💼 Salary', type: 'income', order: 1, isDeleted: false },
  { id: 'cat-freelance', name: '💻 Freelance', type: 'income', order: 2, isDeleted: false },
  { id: 'cat-business', name: '🏪 Business', type: 'income', order: 3, isDeleted: false },
  { id: 'cat-investment', name: '📈 Investment', type: 'income', order: 4, isDeleted: false },
  { id: 'cat-gift', name: '🎁 Gift & Allowance', type: 'income', order: 5, isDeleted: false },
]

const SEED_ACCOUNT_GROUPS: AccountGroup[] = [
  { id: 'grp-cash', name: 'Cash', type: 11, order: 1, isDeleted: false },
  { id: 'grp-accounts', name: 'Accounts', type: 1, order: 2, isDeleted: false },
  { id: 'grp-card', name: 'Card', type: 2, order: 3, isDeleted: false },
  { id: 'grp-debit', name: 'Debit Card', type: 3, order: 4, isDeleted: false },
  { id: 'grp-savings', name: 'Savings', type: 4, order: 5, isDeleted: false },
  { id: 'grp-topup', name: 'Top-Up/Prepaid', type: 6, order: 6, isDeleted: false },
  { id: 'grp-investments', name: 'Investments', type: 8, order: 7, isDeleted: false },
  { id: 'grp-overdrafts', name: 'Overdrafts', type: 9, order: 8, isDeleted: false },
  { id: 'grp-loan', name: 'Loan', type: 5, order: 9, isDeleted: false },
  { id: 'grp-insurance', name: 'Insurance', type: 10, order: 10, isDeleted: false },
  { id: 'grp-others', name: 'Others', type: 7, order: 11, isDeleted: false },
]

const SEED_ACCOUNTS: Account[] = [
  {
    id: '__general__',
    name: 'General',
    groupId: 'grp-cash',
    currencyId: 'PHP_PHP',
    order: 1,
    isDeleted: false,
  },
]

const DEFAULT_SETTINGS: AppSettings = {
  key: 'singleton',
  schemaVersion: SCHEMA_VERSION,
  defaultCurrencyId: 'PHP_PHP',
  scheduledBackup: {
    enabled: false,
    interval: 'weekly',
    googleDriveEnabled: false,
  },
}

export async function runSeedIfNeeded(): Promise<void> {
  const existing = await db.settings.get('singleton')
  if (existing) return

  await db.transaction(
    'rw',
    [db.currencies, db.categories, db.accountGroups, db.accounts, db.settings],
    async () => {
      await db.currencies.bulkAdd([DEFAULT_CURRENCY])
      await db.categories.bulkAdd(SEED_CATEGORIES)
      await db.accountGroups.bulkAdd(SEED_ACCOUNT_GROUPS)
      await db.accounts.bulkAdd(SEED_ACCOUNTS)
      await db.settings.add(DEFAULT_SETTINGS)
    }
  )
}

export { SCHEMA_VERSION }
