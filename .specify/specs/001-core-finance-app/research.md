# Research: Core Finance App

**Date**: 2026-05-04 | **Spec**: ./spec.md

## Technology Decisions

### IndexedDB Wrapper
- **Decision**: Dexie.js v4
- **Rationale**: Best-in-class TypeScript support; built-in schema versioning and migration API that directly satisfies Constitution Principle IX; transaction-wrapped writes by default; live queries via `useLiveQuery` React hook integrate cleanly with React; actively maintained.
- **Alternatives considered**: Native IDB API (too verbose, no migration DSL), idb (lighter but no live queries), RxDB (overkill, sync-oriented).

### State Management
- **Decision**: Zustand v5 (user-specified)
- **Rationale**: Minimal boilerplate; store slices act as the bridge between client UI and server services; middleware (persist, devtools) available; works well with Dexie live queries alongside.
- **Pattern**: Store actions call server-layer services → update store state. UI reads from store only; never calls services directly.

### UI Components
- **Decision**: Shadcn/UI + Radix UI + Tailwind CSS (user-specified)
- **Rationale**: Accessible by default (Radix primitives satisfy Principle V WAI-ARIA requirements); unstyled base + Tailwind allows full design control; copy-paste component model means no version-lock dependency; works with Chrome target.

### PWA / Service Worker
- **Decision**: vite-plugin-pwa (Workbox-powered)
- **Rationale**: First-class Vite integration; Workbox handles cache strategies declaratively; generates manifest and service worker from config; supports Periodic Background Sync registration; minimal boilerplate for the cache-first (app shell) + network-first (dynamic assets) strategy required by Principle VII.

### Routing
- **Decision**: React Router v6 (DOM)
- **Rationale**: Industry standard for React SPAs; declarative route definitions; hash router variant (`createHashRouter`) required for GitHub Pages since there is no server to handle path rewrites.

### CSV Parsing
- **Decision**: Papa Parse v5
- **Rationale**: Battle-tested; handles large files via streaming; correctly handles quoted fields, emojis (present in category names), and edge cases. Works in browser without Node.js.

### Date Handling
- **Decision**: date-fns v3
- **Rationale**: Tree-shakeable; immutable; locale-aware formatting for currency display; no timezone surprises when working with Unix ms timestamps.

### Google Drive Integration
- **Decision**: Google Identity Services (GIS) for OAuth + `fetch` against Drive REST API v3
- **Rationale**: GIS is the current Google-recommended OAuth flow for browser apps; avoids loading the full gapi client library; Drive REST API v3 supports multipart upload for file creation and simple GET for file listing. OAuth token stored in memory only (not IndexedDB) to avoid persisting credentials.

### Browser Detection (Chrome-only)
- **Decision**: User-agent + feature detection at boot
- **Rationale**: Check `navigator.userAgent` for Chrome (excluding Edge/Opera chromium forks which share the UA string) combined with `window.chrome` object presence. Redirect to `/unsupported` route immediately before React mounts if not Chrome.
- **UA heuristic**: `isChrome = /Chrome\/[\d.]+/.test(ua) && !/Edg\/|OPR\//.test(ua)`

### Import from .mmbak (SQLite backup)
- **Decision**: Handled by a dedicated import service using a WASM SQLite port (sql.js or @sqlite.org/sqlite-wasm)
- **Rationale**: The user's existing backup is a SQLite 3 database. Rather than requiring CSV as the only import path, offering direct .mmbak import gives zero friction migration. sql.js runs entirely in the browser with no server. Import mapping documented in `contracts/import-mapping.md`.

## Source App Data Model Analysis (from .mmbak)

Key findings from the SQLite backup reverse-engineering:

| Source Table | Source Field | Mapping |
|---|---|---|
| INOUTCOME.DO_TYPE | `0` | income transaction |
| INOUTCOME.DO_TYPE | `1` | expense transaction |
| INOUTCOME.DO_TYPE | `3` | transfer OUT side (use this record; skip DO_TYPE=4 pairs) |
| INOUTCOME.DO_TYPE | `4` | transfer IN side (deduplicate via `txUidTrans`) |
| INOUTCOME.DO_TYPE | `7` | scheduled/future transaction (import as-is, type=income) |
| INOUTCOME.ZDATE | epoch ms string | `Transaction.date` (parse as integer) |
| INOUTCOME.ZMONEY | decimal string | `Transaction.amount` (parseFloat) |
| INOUTCOME.ZCONTENT | string | `Transaction.title` |
| INOUTCOME.assetUid | UUID | `Transaction.accountId` (income/expense) or `fromAccountId` (transfer) |
| INOUTCOME.toAssetUid | UUID | `Transaction.toAccountId` (transfer) |
| INOUTCOME.ctgUid | UUID or legacy int or `-4` | `Transaction.categoryId` (null if `-4`) |
| INOUTCOME.txUidTrans | UUID | links transfer pair; deduplicate on import |
| ZCATEGORY.TYPE | `0` | income category |
| ZCATEGORY.TYPE | `1` | expense category |
| ZCATEGORY.C_IS_DEL | `NULL` | active |
| ZCATEGORY.C_IS_DEL | `1` | deleted (skip on import or mark isDeleted) |
| ZCATEGORY.pUid | `''` / `'0'` / UUID | root if empty/'0'; parent UUID otherwise |
| ASSETS.NIC_NAME | string | `Account.name` |
| ASSETS.groupUid | UUID or legacy int | `Account.groupId` |
| CURRENCY.uid | `PHP_PHP` format | `Currency.id` |
| CURRENCY.SYMBOL_POSITION | `P` | prefix |
