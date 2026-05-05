import Papa from 'papaparse'
import JSZip from 'jszip'
import { db } from '@/server/db/db'
import { runSeedIfNeeded } from '@/server/db/migrations'
import type { Transaction, Category, Account, AccountGroup, Currency } from '@/shared/types'

const REQUIRED_FILES = ['transactions.csv', 'categories.csv', 'accounts.csv', 'currencies.csv']

function parseCsv<T>(text: string): T[] {
  const result = Papa.parse<T>(text.replace(/^﻿/, ''), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  })
  return result.data
}

export interface ImportPreview {
  transactionCount: number
  categoryCount: number
  accountCount: number
}

export const CsvImporter = {
  async preview(file: File): Promise<ImportPreview> {
    const zip = await JSZip.loadAsync(file)
    for (const name of REQUIRED_FILES) {
      if (!zip.file(name)) throw new Error(`Invalid backup: missing ${name}`)
    }
    const txText = await zip.file('transactions.csv')!.async('string')
    const catText = await zip.file('categories.csv')!.async('string')
    const accText = await zip.file('accounts.csv')!.async('string')
    const txs = parseCsv<Record<string, unknown>>(txText)
    const cats = parseCsv<Record<string, unknown>>(catText)
    const accs = parseCsv<Record<string, unknown>>(accText)
    return { transactionCount: txs.length, categoryCount: cats.length, accountCount: accs.length }
  },

  async restore(file: File): Promise<ImportPreview> {
    const zip = await JSZip.loadAsync(file)
    for (const name of REQUIRED_FILES) {
      if (!zip.file(name)) throw new Error(`Invalid backup: missing ${name}`)
    }

    const [txText, catText, accText, grpText, curText] = await Promise.all([
      zip.file('transactions.csv')!.async('string'),
      zip.file('categories.csv')!.async('string'),
      zip.file('accounts.csv')!.async('string'),
      zip.file('account_groups.csv')?.async('string') ?? Promise.resolve(''),
      zip.file('currencies.csv')!.async('string'),
    ])

    const rawTx = parseCsv<Record<string, string | number | boolean>>(txText)
    const rawCat = parseCsv<Record<string, string | number | boolean>>(catText)
    const rawAcc = parseCsv<Record<string, string | number | boolean>>(accText)
    const rawGrp = grpText ? parseCsv<Record<string, string | number | boolean>>(grpText) : []
    const rawCur = parseCsv<Record<string, string | number | boolean>>(curText)

    const transactions: Transaction[] = rawTx.map((r) => ({
      id: String(r.id),
      type: String(r.type) as Transaction['type'],
      title: String(r.title),
      amount: parseFloat(String(r.amount)),
      note: r.note ? String(r.note) : undefined,
      categoryId: r.category_id ? String(r.category_id) : undefined,
      accountId: r.account_id ? String(r.account_id) : undefined,
      fromAccountId: r.from_account_id ? String(r.from_account_id) : undefined,
      toAccountId: r.to_account_id ? String(r.to_account_id) : undefined,
      currencyId: String(r.currency_id),
      date: Number(r.date_ms),
      createdAt: Number(r.created_at_ms),
      updatedAt: Number(r.updated_at_ms),
      isDeleted: String(r.is_deleted) === 'true',
    }))

    const categories: Category[] = rawCat.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      type: String(r.type) as Category['type'],
      parentId: r.parent_id ? String(r.parent_id) : undefined,
      order: Number(r.order),
      isDeleted: String(r.is_deleted) === 'true',
    }))

    const accounts: Account[] = rawAcc.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      groupId: r.group_id ? String(r.group_id) : undefined,
      currencyId: String(r.currency_id),
      order: Number(r.order),
      isDeleted: String(r.is_deleted) === 'true',
    }))

    const accountGroups: AccountGroup[] = rawGrp.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      type: Number(r.type),
      order: Number(r.order),
      isDeleted: String(r.is_deleted) === 'true',
    }))

    const currencies: Currency[] = rawCur.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      isoCode: String(r.iso_code),
      symbol: String(r.symbol),
      symbolPosition: String(r.symbol_position) as Currency['symbolPosition'],
      decimalPlaces: Number(r.decimal_places),
      isDefault: String(r.is_default) === 'true',
    }))

    await db.transaction(
      'rw',
      [db.transactions, db.categories, db.accounts, db.accountGroups, db.currencies, db.settings],
      async () => {
        await db.transactions.clear()
        await db.categories.clear()
        await db.accounts.clear()
        await db.accountGroups.clear()
        await db.currencies.clear()
        await db.settings.clear()

        await db.currencies.bulkAdd(currencies)
        await db.categories.bulkAdd(categories)
        await db.accountGroups.bulkAdd(accountGroups)
        await db.accounts.bulkAdd(accounts)
        await db.transactions.bulkAdd(transactions)
      }
    )

    await runSeedIfNeeded()

    return {
      transactionCount: transactions.length,
      categoryCount: categories.length,
      accountCount: accounts.length,
    }
  },
}
