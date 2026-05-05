export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Transaction {
  id: string
  type: TransactionType
  title: string
  amount: number
  note?: string
  categoryId?: string
  accountId?: string
  fromAccountId?: string
  toAccountId?: string
  currencyId: string
  date: number
  createdAt: number
  updatedAt: number
  isDeleted: boolean
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  parentId?: string
  order: number
  isDeleted: boolean
}

export interface Account {
  id: string
  name: string
  groupId?: string
  currencyId: string
  order: number
  isDeleted: boolean
}

export interface AccountGroup {
  id: string
  name: string
  type: number
  order: number
  isDeleted: boolean
}

export interface Currency {
  id: string
  name: string
  isoCode: string
  symbol: string
  symbolPosition: 'prefix' | 'suffix'
  decimalPlaces: number
  isDefault: boolean
}

export interface ScheduledBackup {
  enabled: boolean
  interval: 'daily' | 'weekly' | 'monthly'
  lastBackupAt?: number
  googleDriveEnabled: boolean
}

export interface AppSettings {
  key: 'singleton'
  schemaVersion: number
  defaultCurrencyId: string
  scheduledBackup: ScheduledBackup
  storagePermissionGranted?: boolean
  installPromptShown?: boolean
}

export interface BackupLog {
  id: string
  createdAt: number
  destination: 'local' | 'google_drive'
  triggerType: 'manual' | 'scheduled'
  recordCount: number
  status: 'success' | 'failed'
  errorMessage?: string
}

export interface TransactionFilters {
  type?: TransactionType | ''
  accountId?: string
  categoryId?: string
  dateFrom?: number
  dateTo?: number
  search?: string
}

export interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}
