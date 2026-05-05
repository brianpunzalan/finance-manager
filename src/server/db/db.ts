import Dexie, { type EntityTable } from 'dexie'
import type {
  Transaction,
  Category,
  Account,
  AccountGroup,
  Currency,
  AppSettings,
  BackupLog,
} from '@/shared/types'

export class FinanceManagerDB extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  categories!: EntityTable<Category, 'id'>
  accounts!: EntityTable<Account, 'id'>
  accountGroups!: EntityTable<AccountGroup, 'id'>
  currencies!: EntityTable<Currency, 'id'>
  settings!: EntityTable<AppSettings, 'key'>
  backupLog!: EntityTable<BackupLog, 'id'>

  constructor() {
    super('FinanceManagerDB')

    this.version(1).stores({
      transactions:
        'id, type, accountId, fromAccountId, toAccountId, categoryId, date, [type+date], isDeleted',
      categories: 'id, type, parentId, isDeleted',
      accounts: 'id, groupId, isDeleted',
      accountGroups: 'id, isDeleted',
      currencies: 'id',
      settings: 'key',
      backupLog: 'id, createdAt, destination',
    })
  }
}

export const db = new FinanceManagerDB()
