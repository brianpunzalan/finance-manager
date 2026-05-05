import { db } from '@/server/db/db'
import type { Account, AccountGroup } from '@/shared/types'

const SYSTEM_IDS = new Set(['__general__'])

export const AccountService = {
  async getAll(): Promise<Account[]> {
    return db.accounts.filter((a) => !a.isDeleted).toArray()
  },

  async getGroups(): Promise<AccountGroup[]> {
    return db.accountGroups.filter((g) => !g.isDeleted).toArray()
  },

  async add(data: { name: string; groupId?: string; currencyId: string }): Promise<void> {
    if (!data.name.trim()) throw new Error('Account name is required')
    const count = await db.accounts.count()
    await db.accounts.add({
      id: crypto.randomUUID(),
      name: data.name.trim(),
      groupId: data.groupId,
      currencyId: data.currencyId,
      order: count + 1,
      isDeleted: false,
    })
  },

  async rename(id: string, name: string): Promise<void> {
    if (!name.trim()) throw new Error('Account name is required')
    await db.accounts.update(id, { name: name.trim() })
  },

  async softDelete(id: string): Promise<void> {
    if (SYSTEM_IDS.has(id)) throw new Error('System accounts cannot be deleted')
    const account = await db.accounts.get(id)
    if (!account) throw new Error('Account not found')

    await db.transaction('rw', [db.accounts, db.transactions], async () => {
      await db.accounts.update(id, { isDeleted: true })
      await db.transactions
        .where('accountId')
        .equals(id)
        .modify({ accountId: '__general__' })
      await db.transactions
        .where('fromAccountId')
        .equals(id)
        .modify({ fromAccountId: '__general__' })
      await db.transactions
        .where('toAccountId')
        .equals(id)
        .modify({ toAccountId: '__general__' })
    })
  },
}
