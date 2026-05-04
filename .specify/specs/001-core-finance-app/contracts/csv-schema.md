# CSV Export / Import Schema

**Version**: 1.0 | **Date**: 2026-05-04

The export artifact is a **ZIP file** (`.fmbak.zip`) containing multiple CSV files.
All CSV files use UTF-8 encoding with a BOM header. Fields are comma-delimited.
String fields containing commas or newlines are quoted. Empty optional fields are empty strings.

---

## transactions.csv

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string (UUID) | Yes | Unique transaction identifier |
| `type` | enum | Yes | `income` \| `expense` \| `transfer` |
| `title` | string | Yes | Transaction title / description |
| `amount` | decimal | Yes | Positive number, e.g. `1500.00` |
| `note` | string | No | Optional free-text note |
| `category_id` | string | Conditional | Required for income/expense; empty for transfer |
| `account_id` | string | Conditional | Required for income/expense; empty for transfer |
| `from_account_id` | string | Conditional | Required for transfer; empty for income/expense |
| `to_account_id` | string | Conditional | Required for transfer; empty for income/expense |
| `currency_id` | string | Yes | References currencies.csv `id` |
| `date_ms` | integer | Yes | Unix timestamp in milliseconds |
| `created_at_ms` | integer | Yes | Unix timestamp in milliseconds |
| `updated_at_ms` | integer | Yes | Unix timestamp in milliseconds |
| `is_deleted` | boolean | Yes | `true` \| `false` |

**Sample row:**
```
id,type,title,amount,note,category_id,account_id,from_account_id,to_account_id,currency_id,date_ms,created_at_ms,updated_at_ms,is_deleted
"a1b2c3d4-...","expense","SUBWAY BLACK COFFEE","100.00","","5c7b5640-...","74ac60c8-...","","","PHP_PHP","1707185222168","1707185222168","1707185222168","false"
```

---

## categories.csv

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | Yes | Unique category identifier |
| `name` | string | Yes | Display name; may include emoji |
| `type` | enum | Yes | `income` \| `expense` |
| `parent_id` | string | No | Parent category `id`; empty = root |
| `order` | integer | Yes | Display sort order |
| `is_deleted` | boolean | Yes | `true` \| `false` |

---

## accounts.csv

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | Yes | Unique account identifier |
| `name` | string | Yes | Display name |
| `group_id` | string | No | References account_groups.csv `id` |
| `currency_id` | string | Yes | References currencies.csv `id` |
| `order` | integer | Yes | Display sort order |
| `is_deleted` | boolean | Yes | `true` \| `false` |

---

## account_groups.csv

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | Yes | Unique group identifier |
| `name` | string | Yes | Display name |
| `type` | integer | Yes | Numeric type code |
| `order` | integer | Yes | Display sort order |
| `is_deleted` | boolean | Yes | `true` \| `false` |

---

## currencies.csv

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | Yes | Format `{ISO}_{ISO}`, e.g. `PHP_PHP` |
| `name` | string | Yes | Full display name |
| `iso_code` | string | Yes | ISO 4217 code, e.g. `PHP` |
| `symbol` | string | Yes | Currency symbol, e.g. `₱` |
| `symbol_position` | enum | Yes | `prefix` \| `suffix` |
| `decimal_places` | integer | Yes | e.g. `2` |
| `is_default` | boolean | Yes | `true` \| `false` |

---

## settings.csv

Single data row (plus header). Captures app-level settings at export time.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `schema_version` | integer | Yes | DB schema version at export time |
| `default_currency_id` | string | Yes | Active currency `id` |
| `backup_interval` | enum | Yes | `daily` \| `weekly` \| `monthly` \| `none` |
| `exported_at_ms` | integer | Yes | Export timestamp in milliseconds |

---

## Import from .mmbak (SQLite backup from MoneyManager EX / similar)

The app provides a separate import path for `.mmbak` SQLite files via an in-browser
WASM SQLite reader. Mapping rules:

| Source | Target | Notes |
|--------|--------|-------|
| `INOUTCOME` (DO_TYPE=0) | `transactions` (type=income) | `ZMONEY` → amount |
| `INOUTCOME` (DO_TYPE=1) | `transactions` (type=expense) | |
| `INOUTCOME` (DO_TYPE=3) | `transactions` (type=transfer) | Use DO_TYPE=3 record only; skip paired DO_TYPE=4 (same `txUidTrans`) |
| `INOUTCOME` (DO_TYPE=4) | Skip | Duplicate of DO_TYPE=3 pair |
| `INOUTCOME` (DO_TYPE=7) | `transactions` (type=income) | Treat as income |
| `INOUTCOME.ZDATE` | `date` | Parse as integer ms |
| `INOUTCOME.ctgUid = '-4'` | `categoryId = null` | System "no category" sentinel |
| `ZCATEGORY.TYPE=0` | `Category.type = 'income'` | |
| `ZCATEGORY.TYPE=1` | `Category.type = 'expense'` | |
| `ZCATEGORY.C_IS_DEL=NULL` | `isDeleted = false` | NULL means active |
| `ZCATEGORY.C_IS_DEL=1` | `isDeleted = true` | |
| `ZCATEGORY.pUid = '' / '0'` | `parentId = undefined` | Root category |
| `ASSETS.NIC_NAME` | `Account.name` | |
| `ASSETGROUP` | `AccountGroup` | Preserve uid, name, type, order |
| `CURRENCY.SYMBOL_POSITION='P'` | `symbolPosition = 'prefix'` | |
