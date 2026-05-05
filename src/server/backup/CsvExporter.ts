import Papa from 'papaparse'
import JSZip from 'jszip'
import { db } from '@/server/db/db'
import { SettingsService } from '@/server/services/SettingsService'

export const CsvExporter = {
  async exportToBlob(): Promise<Blob> {
    const [transactions, categories, accounts, accountGroups, currencies, settings] =
      await Promise.all([
        db.transactions.toArray(),
        db.categories.toArray(),
        db.accounts.toArray(),
        db.accountGroups.toArray(),
        db.currencies.toArray(),
        SettingsService.get(),
      ])

    const zip = new JSZip()
    const BOM = '﻿'

    zip.file(
      'transactions.csv',
      BOM +
        Papa.unparse(
          transactions.map((t) => ({
            id: t.id,
            type: t.type,
            title: t.title,
            amount: t.amount.toFixed(2),
            note: t.note ?? '',
            category_id: t.categoryId ?? '',
            account_id: t.accountId ?? '',
            from_account_id: t.fromAccountId ?? '',
            to_account_id: t.toAccountId ?? '',
            currency_id: t.currencyId,
            date_ms: t.date,
            created_at_ms: t.createdAt,
            updated_at_ms: t.updatedAt,
            is_deleted: t.isDeleted,
          }))
        )
    )

    zip.file(
      'categories.csv',
      BOM +
        Papa.unparse(
          categories.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            parent_id: c.parentId ?? '',
            order: c.order,
            is_deleted: c.isDeleted,
          }))
        )
    )

    zip.file(
      'accounts.csv',
      BOM +
        Papa.unparse(
          accounts.map((a) => ({
            id: a.id,
            name: a.name,
            group_id: a.groupId ?? '',
            currency_id: a.currencyId,
            order: a.order,
            is_deleted: a.isDeleted,
          }))
        )
    )

    zip.file(
      'account_groups.csv',
      BOM +
        Papa.unparse(
          accountGroups.map((g) => ({
            id: g.id,
            name: g.name,
            type: g.type,
            order: g.order,
            is_deleted: g.isDeleted,
          }))
        )
    )

    zip.file(
      'currencies.csv',
      BOM +
        Papa.unparse(
          currencies.map((c) => ({
            id: c.id,
            name: c.name,
            iso_code: c.isoCode,
            symbol: c.symbol,
            symbol_position: c.symbolPosition,
            decimal_places: c.decimalPlaces,
            is_default: c.isDefault,
          }))
        )
    )

    if (settings) {
      zip.file(
        'settings.csv',
        BOM +
          Papa.unparse([
            {
              schema_version: settings.schemaVersion,
              default_currency_id: settings.defaultCurrencyId,
              backup_interval: settings.scheduledBackup.interval,
              exported_at_ms: Date.now(),
            },
          ])
      )
    }

    return zip.generateAsync({ type: 'blob' })
  },

  downloadBlob(blob: Blob): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-backup-${new Date().toISOString().slice(0, 10)}.fmbak.zip`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  },

  async exportAndDownload(): Promise<number> {
    const blob = await CsvExporter.exportToBlob()
    CsvExporter.downloadBlob(blob)
    const count = await db.transactions.count()
    return count
  },
}
