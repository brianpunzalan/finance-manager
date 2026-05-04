# Data Model: Core Finance App

**Date**: 2026-05-04 | **Spec**: ./spec.md | **Research**: ./research.md

## IndexedDB Database

**Name**: `FinanceManagerDB`
**Schema version**: tracked in `settings` store; incremented on every breaking-additive migration.

---

## Entity Definitions

### Transaction

Primary store. Represents a single income, expense, or transfer entry.

```typescript
interface Transaction {
  id: string;              // UUID v4
  type: 'income' | 'expense' | 'transfer';
  title: string;           // required; maps from ZCONTENT
  amount: number;          // positive decimal; maps from ZMONEY
  note?: string;           // optional free-text
  categoryId?: string;     // required for income/expense; optional for transfer
  accountId?: string;      // income/expense: the single account
  fromAccountId?: string;  // transfer: source account
  toAccountId?: string;    // transfer: destination account
  currencyId: string;      // references Currency.id
  date: number;            // Unix timestamp ms; maps from ZDATE
  createdAt: number;       // Unix timestamp ms
  updatedAt: number;       // Unix timestamp ms
  isDeleted: boolean;      // soft delete
}
```

**Constraints:**
- `type === 'income' | 'expense'` → `accountId` required, `categoryId` required
- `type === 'transfer'` → `fromAccountId` required, `toAccountId` required, `fromAccountId !== toAccountId`
- `amount > 0`
- `categoryId` must reference an existing non-deleted Category
- `accountId` / `fromAccountId` / `toAccountId` must reference existing Accounts

**Indexes (Dexie):**
```
++id, type, accountId, fromAccountId, toAccountId, categoryId, date, [type+date], isDeleted
```

---

### Category

```typescript
interface Category {
  id: string;              // UUID v4 or legacy integer string (for imported data)
  name: string;            // display name; may include emoji (e.g. "🍜 Food")
  type: 'income' | 'expense'; // maps from ZCATEGORY.TYPE: 0=income, 1=expense
  parentId?: string;       // UUID of parent Category; null/undefined = root
  order: number;           // display sort order
  isDeleted: boolean;      // soft delete; reassigns transactions to fallback
}
```

**System fallbacks (never deletable, seeded on first launch):**
| id | name | type |
|---|---|---|
| `__uncategorized__` | Uncategorized | expense |
| `__general_income__` | General Income | income |

**Default seed categories (all root-level, isDeleted=false):**

*Income (type: 'income'):*
Allowance, Salary, Petty Cash, Bonus, Freelance, Business, Investment, Gift & Allowance, Other

*Expense (type: 'expense'):*
Food & Drink, Transport, Shopping, Bills & Utilities, Health & Medical, Housing & Rent, Entertainment, Education, Personal Care, Travel, Other

**Indexes (Dexie):**
```
++id, type, parentId, isDeleted
```

---

### Account

```typescript
interface Account {
  id: string;              // UUID v4 or legacy integer string
  name: string;            // display name (e.g. "GCash", "BPI")
  groupId?: string;        // references AccountGroup.id
  currencyId: string;      // references Currency.id
  order: number;
  isDeleted: boolean;
}
```

**System fallback (never deletable):**
| id | name |
|---|---|
| `__general__` | General |

**Default seed accounts:** `General`

**Indexes (Dexie):**
```
++id, groupId, isDeleted
```

---

### AccountGroup

```typescript
interface AccountGroup {
  id: string;              // UUID v4 or legacy integer string
  name: string;            // e.g. "Accounts", "Card", "Cash"
  type: number;            // numeric type code (from ASSETGROUP.TYPE)
  order: number;
  isDeleted: boolean;
}
```

**Default seed groups (matching source app):**
Cash (type 11, order 1), Accounts (type 1, order 2), Card (type 2, order 3),
Debit Card (type 3, order 4), Savings (type 4, order 5), Top-Up/Prepaid (type 6, order 6),
Investments (type 8, order 7), Overdrafts (type 9, order 8), Loan (type 5, order 9),
Insurance (type 10, order 10), Others (type 7, order 11)

**Indexes (Dexie):**
```
++id, isDeleted
```

---

### Currency

```typescript
interface Currency {
  id: string;              // format: "{ISO}_{ISO}" e.g. "PHP_PHP"
  name: string;            // e.g. "PHP - Pilipinas (₱)"
  isoCode: string;         // ISO 4217 e.g. "PHP"
  symbol: string;          // e.g. "₱"
  symbolPosition: 'prefix' | 'suffix';
  decimalPlaces: number;   // e.g. 2
  isDefault: boolean;
}
```

**Indexes (Dexie):**
```
++id
```

---

### AppSettings

Single-record store (key = `'singleton'`).

```typescript
interface AppSettings {
  key: 'singleton';
  schemaVersion: number;       // current DB schema version
  defaultCurrencyId: string;   // active display currency
  scheduledBackup: {
    enabled: boolean;
    interval: 'daily' | 'weekly' | 'monthly';
    lastBackupAt?: number;      // Unix ms of last successful backup
    googleDriveEnabled: boolean;
  };
  storagePermissionGranted?: boolean;
  installPromptShown?: boolean;
}
```

**Indexes (Dexie):**
```
key
```

---

### BackupLog

Audit trail of export operations.

```typescript
interface BackupLog {
  id: string;              // UUID v4
  createdAt: number;       // Unix ms
  destination: 'local' | 'google_drive';
  triggerType: 'manual' | 'scheduled';
  recordCount: number;     // total transactions exported
  status: 'success' | 'failed';
  errorMessage?: string;
}
```

**Indexes (Dexie):**
```
++id, createdAt, destination
```

---

## Dexie Database Definition

```typescript
// src/server/db/schema.ts
import Dexie, { type EntityTable } from 'dexie';

export const db = new Dexie('FinanceManagerDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  categories:   EntityTable<Category,    'id'>;
  accounts:     EntityTable<Account,     'id'>;
  accountGroups: EntityTable<AccountGroup, 'id'>;
  currencies:   EntityTable<Currency,    'id'>;
  settings:     EntityTable<AppSettings, 'key'>;
  backupLog:    EntityTable<BackupLog,   'id'>;
};

db.version(1).stores({
  transactions:  'id, type, accountId, fromAccountId, toAccountId, categoryId, date, [type+date], isDeleted',
  categories:    'id, type, parentId, isDeleted',
  accounts:      'id, groupId, isDeleted',
  accountGroups: 'id, isDeleted',
  currencies:    'id',
  settings:      'key',
  backupLog:     'id, createdAt, destination',
});
```

---

## Schema Migration Rules (Principle IX)

- Increment `db.version()` for every schema change.
- Only additive changes allowed: new stores, new indexes, new optional fields.
- Never rename or remove an existing store or index in a version upgrade.
- Use `.upgrade(tx => ...)` to backfill new required fields with safe defaults.
- `AppSettings.schemaVersion` mirrors the Dexie version number.

---

## State Transitions

### Transaction Lifecycle
```
draft → saved → [edited → saved] → soft-deleted
```
- Soft delete sets `isDeleted = true`; record is retained for potential restore.
- Hard delete not exposed in UI.

### Category / Account Lifecycle
```
active → soft-deleted (reassign dependents to fallback)
```
- On category delete: all transactions with `categoryId === deletedId` get `categoryId = '__uncategorized__'` (expense) or `'__general_income__'` (income) — run inside a single Dexie transaction.
- On account delete: all transactions with `accountId|fromAccountId|toAccountId === deletedId` get replaced with `'__general__'` — same single-transaction guarantee.
