import { db } from '@/server/db/db'
import type { Transaction, Category, Account, AccountGroup, Currency } from '@/shared/types'

interface SqliteRow {
  [col: string]: string | number | null
}

export const MmbakImporter = {
  async import(file: File): Promise<{ transactionCount: number }> {
    const buffer = await file.arrayBuffer()

    // Dynamically load sqlite-wasm to avoid bundling issues
    const sqlite3InitModule = (
      await import('@sqlite.org/sqlite-wasm')
    ).default

    const sqlite3 = await sqlite3InitModule({ print: () => {}, printErr: () => {} })
    const db_wasm = new sqlite3.oo1.DB()

    try {
      sqlite3.capi.sqlite3_deserialize(
        db_wasm.pointer,
        'main',
        buffer,
        buffer.byteLength,
        buffer.byteLength,
        sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
      )

      function query(sql: string): SqliteRow[] {
        const rows: SqliteRow[] = []
        db_wasm.exec({ sql, rowMode: 'object', callback: (row: SqliteRow) => rows.push(row) })
        return rows
      }

      // Import currencies
      const rawCurrencies = query(`SELECT uid, NAME, ISO_CODE, SYMBOL, SYMBOL_POSITION, DECIMAL_PLACES FROM CURRENCY`)
      const currencies: Currency[] = rawCurrencies.map((r) => ({
        id: String(r.uid),
        name: String(r.NAME ?? r.uid),
        isoCode: String(r.ISO_CODE ?? r.uid),
        symbol: String(r.SYMBOL ?? ''),
        symbolPosition: r.SYMBOL_POSITION === 'P' ? 'prefix' : 'suffix',
        decimalPlaces: Number(r.DECIMAL_PLACES ?? 2),
        isDefault: false,
      }))
      if (currencies.length > 0) currencies[0].isDefault = true

      // Import account groups
      const rawGroups = query(`SELECT uid, NAME, TYPE, DISPLAY_ORDER FROM ASSETGROUP`)
      const accountGroups: AccountGroup[] = rawGroups.map((r, i) => ({
        id: String(r.uid),
        name: String(r.NAME),
        type: Number(r.TYPE ?? 1),
        order: Number(r.DISPLAY_ORDER ?? i + 1),
        isDeleted: false,
      }))

      // Import accounts
      const rawAccounts = query(`SELECT uid, NIC_NAME, groupUid, currencyUid, DISPLAY_ORDER FROM ASSETS WHERE IS_DEL IS NULL OR IS_DEL = 0`)
      const accounts: Account[] = rawAccounts.map((r, i) => ({
        id: String(r.uid),
        name: String(r.NIC_NAME),
        groupId: r.groupUid ? String(r.groupUid) : undefined,
        currencyId: r.currencyUid ? String(r.currencyUid) : (currencies[0]?.id ?? 'PHP_PHP'),
        order: Number(r.DISPLAY_ORDER ?? i + 1),
        isDeleted: false,
      }))

      // Import categories
      const rawCategories = query(`SELECT uid, NAME, TYPE, pUid, DISPLAY_ORDER, C_IS_DEL FROM ZCATEGORY`)
      const categories: Category[] = rawCategories.map((r, i) => ({
        id: String(r.uid),
        name: String(r.NAME),
        type: Number(r.TYPE) === 0 ? 'income' : 'expense',
        parentId: r.pUid && r.pUid !== '' && r.pUid !== '0' ? String(r.pUid) : undefined,
        order: Number(r.DISPLAY_ORDER ?? i + 1),
        isDeleted: r.C_IS_DEL === 1,
      }))

      // Add system fallbacks if missing
      if (!categories.find((c) => c.id === '__uncategorized__')) {
        categories.push({ id: '__uncategorized__', name: 'Uncategorized', type: 'expense', order: 0, isDeleted: false })
      }
      if (!categories.find((c) => c.id === '__general_income__')) {
        categories.push({ id: '__general_income__', name: 'General Income', type: 'income', order: 0, isDeleted: false })
      }
      if (!accounts.find((a) => a.id === '__general__')) {
        accounts.push({ id: '__general__', name: 'General', currencyId: currencies[0]?.id ?? 'PHP_PHP', order: 0, isDeleted: false })
      }

      // Import transactions — skip DO_TYPE=4 (transfer IN duplicates)
      const rawTx = query(`
        SELECT uid, DO_TYPE, ZCONTENT, ZMONEY, NOTE, ctgUid, assetUid, toAssetUid, txUidTrans, ZDATE, currencyUid
        FROM INOUTCOME
        WHERE DO_TYPE != 4
        ORDER BY ZDATE DESC
      `)

      const transactions: Transaction[] = rawTx.map((r) => {
        const doType = Number(r.DO_TYPE)
        const type: Transaction['type'] =
          doType === 3 ? 'transfer' : doType === 1 ? 'expense' : 'income'
        const categoryId =
          r.ctgUid === '-4' || !r.ctgUid
            ? type === 'income'
              ? '__general_income__'
              : '__uncategorized__'
            : String(r.ctgUid)
        const now = Date.now()
        const date = r.ZDATE ? Number(r.ZDATE) : now

        return {
          id: String(r.uid),
          type,
          title: String(r.ZCONTENT ?? ''),
          amount: Math.abs(parseFloat(String(r.ZMONEY ?? '0'))),
          note: r.NOTE ? String(r.NOTE) : undefined,
          categoryId: type !== 'transfer' ? categoryId : undefined,
          accountId: type !== 'transfer' ? (r.assetUid ? String(r.assetUid) : '__general__') : undefined,
          fromAccountId: type === 'transfer' ? (r.assetUid ? String(r.assetUid) : '__general__') : undefined,
          toAccountId: type === 'transfer' ? (r.toAssetUid ? String(r.toAssetUid) : '__general__') : undefined,
          currencyId: r.currencyUid ? String(r.currencyUid) : (currencies[0]?.id ?? 'PHP_PHP'),
          date,
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
        }
      })

      await db.transaction(
        'rw',
        [db.transactions, db.categories, db.accounts, db.accountGroups, db.currencies],
        async () => {
          if (currencies.length) await db.currencies.bulkPut(currencies)
          if (accountGroups.length) await db.accountGroups.bulkPut(accountGroups)
          if (accounts.length) await db.accounts.bulkPut(accounts)
          if (categories.length) await db.categories.bulkPut(categories)
          if (transactions.length) await db.transactions.bulkPut(transactions)
        }
      )

      return { transactionCount: transactions.length }
    } finally {
      db_wasm.close()
    }
  },
}
