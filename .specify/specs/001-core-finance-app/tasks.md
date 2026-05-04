# Tasks: Core Finance App

**Input**: Design documents from `/specs/001-core-finance-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/csv-schema.md ✅

**Tests**: No test tasks — no tests were requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on other in-progress tasks)
- **[Story]**: Which user story this task belongs to (US1–US6)
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project scaffolding, dependency installation, tooling configuration. Must be complete before any code is written.

- [ ] T001 Create project directory structure per plan.md (src/client/, src/server/, src/store/, src/shared/, src/worker/, public/icons/)
- [ ] T002 Initialize Vite 6 + React 19 + TypeScript 5 project; add all dependencies to package.json (react, react-dom, react-router-dom, zustand, dexie, vite-plugin-pwa, workbox-window, tailwindcss, @tailwindcss/vite, lucide-react, date-fns, papaparse, jszip, @sqlite.org/sqlite-wasm)
- [ ] T003 [P] Configure TypeScript in tsconfig.json (strict mode, path alias `@/` → `src/`, target ESNext, moduleResolution bundler)
- [ ] T004 [P] Configure vite.config.ts (base: '/finance-manager/', React plugin, `@/` alias, exclude @sqlite.org/sqlite-wasm from optimization)
- [ ] T005 [P] Configure Tailwind CSS 4 in src/index.css with @import and design tokens; add `@tailwindcss/vite` plugin to vite.config.ts
- [ ] T006 Initialize shadcn/ui (`npx shadcn@latest init`); add core components: button, dialog, form, select, input, textarea, toast, badge, sheet, separator, label, scroll-area
- [ ] T007 [P] Create .env.example with `VITE_GOOGLE_CLIENT_ID=` placeholder
- [ ] T008 [P] Create .github/workflows/deploy.yml for GitHub Pages CD per plan.md workflow spec

**Checkpoint**: `npm run dev` starts; shadcn components are importable; deploy workflow is present.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on. Must be 100% complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T009 Define all TypeScript interfaces in src/shared/types/index.ts (Transaction, Category, Account, AccountGroup, Currency, AppSettings, BackupLog per data-model.md)
- [ ] T010 Implement Dexie database instance in src/server/db/db.ts and src/server/db/schema.ts (FinanceManagerDB v1 with all 7 stores and indexes from data-model.md)
- [ ] T011 Implement database seed function in src/server/db/migrations.ts: db.version(1).upgrade that seeds default categories (income + expense presets), system fallbacks (`__uncategorized__`, `__general_income__`, `__general__`), default AccountGroups, PHP currency, and singleton AppSettings if not present
- [ ] T012 Implement browser guard in src/browser-guard.ts (UA regex: `/Chrome\/[\d.]+/.test(ua) && !/Edg\/|OPR\//.test(ua)`; sets `window.location.hash = '/unsupported'` if not Chrome before React mounts)
- [ ] T013 [P] Create src/main.tsx entry point: imports browser-guard.ts, then mounts React App into `#root`
- [ ] T014 [P] Implement UnsupportedBrowserPage in src/client/pages/UnsupportedBrowserPage.tsx (explains Chrome-only scope; no app functionality rendered)
- [ ] T015 Setup HashRouter in src/App.tsx with routes: `/` → TransactionsPage, `/settings` → SettingsPage, `/unsupported` → UnsupportedBrowserPage; wrap in ErrorBoundary
- [ ] T016 [P] Implement AppShell layout in src/client/components/layout/AppShell.tsx (renders TopBar + page content + BottomNav)
- [ ] T017 [P] Implement TopBar component in src/client/components/layout/TopBar.tsx (page title, action slot)
- [ ] T018 [P] Implement BottomNav component in src/client/components/layout/BottomNav.tsx (Transactions tab, Settings tab; active state via React Router)
- [ ] T019 [P] Implement ErrorBoundary in src/client/components/shared/ErrorBoundary.tsx (catches render errors; shows fallback UI with retry)
- [ ] T020 [P] Implement LoadingSpinner in src/client/components/shared/LoadingSpinner.tsx
- [ ] T021 [P] Implement uiStore in src/store/uiStore.ts (online/offline state, install prompt deferred event, DB error state, toast queue)
- [ ] T022 [P] Implement ConnectivityBanner in src/client/components/shared/ConnectivityBanner.tsx (reads uiStore; shows banner when offline)

**Checkpoint**: App renders in Chrome; bottom nav works; non-Chrome browsers are redirected to /unsupported; `npm run build` succeeds.

---

## Phase 3: User Story 1 — Record a Financial Transaction (Priority: P1) 🎯 MVP

**Goal**: User can open a form, choose income/expense/transfer, fill required fields, submit, and see the new transaction confirmed.

**Independent Test**: Submit one income, one expense, and one transfer with valid data. Confirm each saves without error. Confirm transfer rejects same-account selection. Confirm empty required fields block submission.

- [ ] T023 [P] [US1] Implement CurrencyService (getAll, getDefault) in src/server/services/CurrencyService.ts
- [ ] T024 [P] [US1] Implement SettingsService (getSingleton, updateSingleton) in src/server/services/SettingsService.ts
- [ ] T025 [US1] Implement TransactionService.addTransaction() in src/server/services/TransactionService.ts (wraps Dexie transaction; validates type constraints from data-model.md; rejects amount ≤ 0 and same-account transfers)
- [ ] T026 [P] [US1] Implement currencyStore in src/store/currencyStore.ts (load currencies, expose default currency for display formatting)
- [ ] T027 [P] [US1] Implement settingsStore in src/store/settingsStore.ts (load and update AppSettings singleton)
- [ ] T028 [US1] Implement transactionStore in src/store/transactionStore.ts with addTransaction action (calls TransactionService; updates local state on success)
- [ ] T029 [P] [US1] Create useTransactions hook in src/client/hooks/useTransactions.ts (wraps transactionStore selectors and addTransaction action)
- [ ] T030 [P] [US1] Create useCategories hook in src/client/hooks/useCategories.ts (wraps categoryStore; exposes categoriesByType selector)
- [ ] T031 [P] [US1] Create useAccounts hook in src/client/hooks/useAccounts.ts (wraps accountStore; exposes accounts list)
- [ ] T032 [US1] Implement TransactionForm component in src/client/components/transaction/TransactionForm.tsx: type toggle (income/expense/transfer), dynamic field set (categoryId + accountId for income/expense; fromAccountId + toAccountId for transfer), title, amount, date/time picker, optional note; inline validation per FR-002–FR-006; disabled submit when no categories/accounts exist
- [ ] T033 [US1] Implement TransactionsPage in src/client/pages/TransactionsPage.tsx with FAB to open TransactionForm in a Sheet/Dialog; wire store actions so submission persists to IndexedDB
- [ ] T034 [US1] Initialize currencyStore and settingsStore on app boot in src/main.tsx (load before first render)

**Checkpoint**: Record income, expense, and transfer transactions. All persist after page reload. Same-account transfer shows inline error. Empty fields block submission.

---

## Phase 4: User Story 2 — View and Manage Transaction History (Priority: P2)

**Goal**: User sees all recorded transactions in reverse-chronological order, can filter/search the list, and can edit or delete any entry.

**Independent Test**: Add several transactions (requires US1). Verify list displays in reverse-chronological order with correct fields per type. Edit one entry and confirm updated values persist. Delete one and confirm removal. Apply type filter and confirm only matching entries show. Clear filter and confirm full list returns.

- [ ] T035 [US2] Extend TransactionService with getAll (sorted by date desc, filtered by isDeleted=false), update (Dexie transaction, re-validates constraints), and softDelete methods in src/server/services/TransactionService.ts
- [ ] T036 [US2] Extend transactionStore with loadTransactions, updateTransaction, deleteTransaction, setFilters, setSearch actions and a derived filteredTransactions selector in src/store/transactionStore.ts
- [ ] T037 [P] [US2] Implement TransactionItem component in src/client/components/transaction/TransactionItem.tsx (income/expense variant: title, amount, category, account, date; transfer variant: title, amount, from → to accounts, date; tap to open edit form)
- [ ] T038 [US2] Implement TransactionList component in src/client/components/transaction/TransactionList.tsx (uses useLiveQuery from Dexie or store subscription; renders TransactionItem list; shows EmptyState when empty)
- [ ] T039 [US2] Implement FilterBar component in src/client/components/transaction/FilterBar.tsx (type multi-select, account select, category select, date-range picker, text search input; dispatches setFilters/setSearch to store; clear-all button visible when any filter active)
- [ ] T040 [P] [US2] Implement EmptyState component in src/client/components/shared/EmptyState.tsx (generic: accepts title, description, optional action button)
- [ ] T041 [US2] Integrate TransactionList and FilterBar into TransactionsPage; call loadTransactions on mount
- [ ] T042 [US2] Extend TransactionForm to support edit mode: accept an optional existing Transaction prop, pre-fill all fields, call updateTransaction on save; re-apply same-account validation on edit

**Checkpoint**: Full list, filter, search, edit, delete all work. Filters combine with AND logic. Clear-filters restores full list.

---

## Phase 5: User Story 3 — Configure Categories (Priority: P3)

**Goal**: User can add, rename, and delete categories from Settings. Deleting a category reassigns affected transactions to the system fallback; the fallback is never deletable.

**Independent Test**: In Settings → Categories, add a new category, rename it, then delete it. Confirm the category picker in the transaction form updates in real time. Confirm empty-name validation blocks save.

- [ ] T043 [US3] Implement CategoryService in src/server/services/CategoryService.ts: add (validates non-empty name), rename (validates non-empty name), softDelete (single Dexie transaction: marks category isDeleted=true, reassigns all matching transactions to `__uncategorized__` or `__general_income__` based on transaction type); blocks delete of system fallbacks
- [ ] T044 [US3] Implement categoryStore in src/store/categoryStore.ts with loadCategories, addCategory, renameCategory, deleteCategory actions
- [ ] T045 [US3] Implement CategorySettings component in src/client/components/settings/CategorySettings.tsx (grouped by income/expense; add form with name + type; inline rename; delete with confirmation dialog; system fallbacks shown as non-deletable)
- [ ] T046 [US3] Create SettingsPage in src/client/pages/SettingsPage.tsx with categories section; load categoryStore on mount; add /settings route in App.tsx if not yet wired

**Checkpoint**: Add, rename, delete categories from Settings. Transaction form picker updates immediately. Deleting a used category reassigns transactions without data loss. Fallback categories cannot be deleted.

---

## Phase 6: User Story 4 — Configure Accounts (Priority: P4)

**Goal**: User can add, rename, and delete accounts from Settings. Deleting an account reassigns affected transactions to the "General" fallback; General is never deletable.

**Independent Test**: In Settings → Accounts, add a new account, rename it, then delete it. Confirm the account picker in the transaction form updates immediately. Confirm empty-name validation blocks save.

- [ ] T047 [US4] Implement AccountService in src/server/services/AccountService.ts: add (validates non-empty name), rename (validates non-empty name), softDelete (single Dexie transaction: marks account isDeleted=true, reassigns all matching accountId/fromAccountId/toAccountId to `__general__`); blocks delete of `__general__`
- [ ] T048 [US4] Implement accountStore in src/store/accountStore.ts with loadAccounts, addAccount, renameAccount, deleteAccount actions
- [ ] T049 [US4] Implement AccountSettings component in src/client/components/settings/AccountSettings.tsx (list with group header; add form; inline rename; delete with confirmation; General account shown as non-deletable)
- [ ] T050 [US4] Add accounts section to SettingsPage in src/client/pages/SettingsPage.tsx; load accountStore on Settings mount

**Checkpoint**: Add, rename, delete accounts from Settings. Transaction form pickers update immediately. Deleting a used account reassigns transactions without data loss. General account cannot be deleted.

---

## Phase 7: User Story 5 — Install and Use Offline as PWA (Priority: P5)

**Goal**: App is installable on Chrome desktop and Android Chrome; all features work offline; non-Chrome browsers see the unsupported page (already wired in Phase 2).

**Independent Test**: Install on Android Chrome from home screen; launch standalone; record a transaction in airplane mode. Open in Firefox/Safari; confirm only the unsupported-browser page renders.

- [ ] T051 [P] [US5] Add vite-plugin-pwa configuration to vite.config.ts: PWA manifest (name, short_name, icons, theme_color, display: standalone, start_url: '/finance-manager/'), Workbox injectManifest strategy with cache-first for app shell (JS/CSS/HTML/images), network-first for Google API origins
- [ ] T052 [P] [US5] Create PWA icons in public/icons/: icon-192x192.png, icon-512x512.png, icon-maskable-512x512.png (SVG-derived or placeholder PNGs sufficient for initial ship)
- [ ] T053 [US5] Implement StoragePersistence.ts in src/server/pwa/StoragePersistence.ts (calls `navigator.storage.persist()` on first launch; updates settingsStore.storagePermissionGranted; returns false if API unavailable)
- [ ] T054 [US5] Implement InstallPrompt.ts in src/server/pwa/InstallPrompt.ts (captures beforeinstallprompt event; exposes `prompt()` method; stores deferred event; prevents duplicate prompt)
- [ ] T055 [US5] Wire StoragePersistence and InstallPrompt into app boot in src/main.tsx; dispatch storage permission result and install prompt to uiStore; show persistent storage warning banner if denied (FR-024)
- [ ] T056 [US5] Render in-app install button from uiStore.installPromptAvailable state (e.g., in TopBar or as a banner); call InstallPrompt.prompt() on click; hide after user responds

**Checkpoint**: `npm run build && npm run preview` — app installs on Android Chrome; launches standalone; works offline. Non-Chrome browsers show unsupported page only. Storage permission requested on first load.

---

## Phase 8: User Story 6 — Export, Backup & Restore (Priority: P6)

**Goal**: User can export all data as a ZIP of CSVs to local download or Google Drive. Scheduled export runs on app open when interval has elapsed. User can restore from a valid backup ZIP. User can import from .mmbak SQLite file.

**Independent Test**: Export to local download → clear all data via browser DevTools → restore from the downloaded ZIP → confirm all records match the original export count. Attempt restore with an invalid file → confirm rejection with error, existing data unchanged.

- [ ] T057 [P] [US6] Implement CsvExporter.ts in src/server/backup/CsvExporter.ts: reads all 7 stores from Dexie, builds 6 CSV files (transactions.csv, categories.csv, accounts.csv, account_groups.csv, currencies.csv, settings.csv) per contracts/csv-schema.md using Papa Parse, packages into a .fmbak.zip via JSZip, triggers browser download or returns Blob for Drive upload
- [ ] T058 [P] [US6] Implement CsvImporter.ts in src/server/backup/CsvImporter.ts: accepts .fmbak.zip Blob, validates presence and headers of all required CSVs, displays record counts to user before restore, replaces all IndexedDB data atomically in a single Dexie transaction, rejects invalid/unrecognized files without touching existing data
- [ ] T059 [P] [US6] Implement MmbakImporter.ts in src/server/backup/MmbakImporter.ts: loads .mmbak file via @sqlite.org/sqlite-wasm, maps INOUTCOME/ZCATEGORY/ASSETS/ASSETGROUP/CURRENCY tables per research.md mapping table (DO_TYPE 0=income,1=expense,3=transfer-out keep/4-skip via txUidTrans, 7=income; ctgUid='-4' → null; C_IS_DEL=NULL→active), inserts into IndexedDB within a Dexie transaction
- [ ] T060 [P] [US6] Implement GoogleDriveService.ts in src/server/backup/GoogleDriveService.ts: GIS token client (VITE_GOOGLE_CLIENT_ID from env), requestAccessToken() flow, uploadFile() via Drive REST v3 multipart to appDataFolder, listFiles() for showing past backups; OAuth token held in memory only (never stored in IndexedDB)
- [ ] T061 [US6] Implement BackupScheduler.ts in src/server/backup/BackupScheduler.ts: on-open trigger checks settings.scheduledBackup.lastBackupAt vs interval; if elapsed, runs CsvExporter → GoogleDriveService.uploadFile(); shows non-blocking toast on completion; registers Periodic Background Sync task if API available
- [ ] T062 [US6] Extend settingsStore in src/store/settingsStore.ts with backup slice (interval, lastBackupAt, googleDriveEnabled) and updateBackupSettings action
- [ ] T063 [US6] Implement BackupSettings component in src/client/components/settings/BackupSettings.tsx: "Export now → Download" button, "Export now → Google Drive" button (triggers GIS OAuth on first use), schedule selector (daily/weekly/monthly/none), "Restore from backup" file picker (accepts .fmbak.zip), "Import from .mmbak" file picker; confirmation dialog showing record count before restore; error display for invalid files
- [ ] T064 [US6] Add backup section to SettingsPage in src/client/pages/SettingsPage.tsx; wire BackupScheduler.checkOnOpen() to app boot in src/main.tsx after DB is ready

**Checkpoint**: Export → restore cycle returns identical record count. Google Drive OAuth flow completes (with valid client ID). Scheduled backup toast appears when interval elapsed. Invalid .fmbak.zip shows error without data loss. .mmbak import brings in categories, accounts, and transactions.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Features that span multiple user stories and final quality gates.

- [ ] T065 [P] Implement CurrencyService full CRUD (add, setDefault) in src/server/services/CurrencyService.ts and extend currencyStore with addCurrency, setDefaultCurrency actions in src/store/currencyStore.ts
- [ ] T066 [P] Implement CurrencySettings component in src/client/components/settings/CurrencySettings.tsx (currency selector dropdown; shows symbol, name, ISO code; updates display immediately on change)
- [ ] T067 Add currency settings section to SettingsPage in src/client/pages/SettingsPage.tsx
- [ ] T068 Implement corrupt-DB error screen (FR-025) in src/client/components/shared/DbErrorScreen.tsx: shows when Dexie throws on open; blocks all writes; offers "Restore from backup" as primary action; "Start fresh" behind explicit double-confirmation; integrate into ErrorBoundary and db.ts open error handler
- [ ] T069 [P] Implement IndexedDB quota-exceeded error surface: catch QuotaExceededError in TransactionService and surface via uiStore toast with guidance to export and delete older entries
- [ ] T070 [P] Accessibility audit: verify all interactive elements in TransactionForm, TransactionList, FilterBar, CategorySettings, AccountSettings, BackupSettings have correct ARIA labels, keyboard focus management, and visible focus indicators (WAI-ARIA, WCAG 2.1 AA)
- [ ] T071 Run Lighthouse PWA audit on production build (`npm run build && npm run preview`); address any gaps preventing score of 100 (manifest, SW registration, installability criteria)
- [ ] T072 Verify GitHub Actions deploy.yml builds successfully and gh-pages branch receives dist/ output; confirm `base: '/finance-manager/'` is correct for GitHub Pages URL

**Checkpoint**: Lighthouse PWA score 100. All interactive elements keyboard-navigable. Corrupt DB shows error screen. Quota errors surface with helpful guidance. App deploys to GitHub Pages.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 complete — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Foundational complete — no dependency on other user stories
- **US2 (Phase 4)**: Depends on Foundational; integrates with US1 (needs transactions to exist)
- **US3 (Phase 5)**: Depends on Foundational; CategoryService may be started in parallel with US2
- **US4 (Phase 6)**: Depends on Foundational; AccountService may be started in parallel with US3
- **US5 (Phase 7)**: Depends on Foundational; PWA config can start in parallel with US1
- **US6 (Phase 8)**: Depends on Foundational + US1 (needs data); can start in parallel with US2–US5
- **Polish (Phase 9)**: Depends on all desired user stories complete

### User Story Dependencies

- **US1**: Start after Phase 2 — no story dependencies
- **US2**: Start after Phase 2 — reads US1 data but is independently testable
- **US3**: Start after Phase 2 — CategoryService referenced by US1 (categories already seeded)
- **US4**: Start after Phase 2 — AccountService referenced by US1 (accounts already seeded)
- **US5**: Start after Phase 2 — PWA layer on top of working app
- **US6**: Start after Phase 2 + US1 (needs real data for export smoke test)

### Within Each User Story

- Services before stores
- Stores before hooks
- Hooks before components
- Components before page integration
- Commit after each task or logical group

### Parallel Opportunities

- All [P]-marked tasks within a phase can run concurrently
- Once Phase 2 is complete: US3, US4, and US5 can run in parallel
- CsvExporter (T057), CsvImporter (T058), MmbakImporter (T059), GoogleDriveService (T060) can all run in parallel within Phase 8

---

## Parallel Example: Phase 2 (Foundational)

```
Start in parallel:
  T009 — TypeScript interfaces
  T013 — main.tsx entry point
  T014 — UnsupportedBrowserPage
  T016 — AppShell layout
  T017 — TopBar
  T018 — BottomNav
  T019 — ErrorBoundary
  T020 — LoadingSpinner
  T021 — uiStore
  T022 — ConnectivityBanner

Sequential (each depends on previous):
  T009 done → T010 Dexie schema
  T010 done → T011 seed migrations
  T012 browser-guard
  T015 App.tsx router (after T014 UnsupportedBrowserPage)
```

## Parallel Example: Phase 8 (US6 — Backup)

```
Start in parallel (all touch different files):
  T057 — CsvExporter.ts
  T058 — CsvImporter.ts
  T059 — MmbakImporter.ts
  T060 — GoogleDriveService.ts

Then:
  T061 — BackupScheduler.ts (depends on T057 + T060)
  T062 — settingsStore backup slice
  T063 — BackupSettings component (depends on T057–T061)
  T064 — Wire into SettingsPage + main.tsx (depends on T063)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Record Transaction)
4. **STOP AND VALIDATE**: Open Chrome, submit income/expense/transfer, reload, confirm data persists
5. Demo / deploy to GitHub Pages

### Incremental Delivery

1. Setup + Foundational → blank app shell deploys
2. + US1 → can record all transaction types (MVP)
3. + US2 → can browse, filter, search, edit, delete
4. + US3 → can manage categories
5. + US4 → can manage accounts
6. + US5 → installable PWA, verified offline
7. + US6 → export, backup, restore, .mmbak import
8. Polish → Lighthouse 100, accessibility audit, CI verified

### Parallel Team Strategy

With multiple developers, once Phase 2 is complete:

- Dev A: US1 → US2
- Dev B: US3 → US4
- Dev C: US5 → US6
- All converge on Polish phase

---

## Summary

| Phase | Tasks | Story | Parallel Opportunities |
|-------|-------|-------|----------------------|
| Phase 1: Setup | T001–T008 (8 tasks) | — | T003–T008 all [P] |
| Phase 2: Foundational | T009–T022 (14 tasks) | — | T013–T022 all [P] |
| Phase 3: US1 Record Transaction | T023–T034 (12 tasks) | US1 P1 | T023–T031 many [P] |
| Phase 4: US2 View & Manage History | T035–T042 (8 tasks) | US2 P2 | T037, T040 [P] |
| Phase 5: US3 Configure Categories | T043–T046 (4 tasks) | US3 P3 | — |
| Phase 6: US4 Configure Accounts | T047–T050 (4 tasks) | US4 P4 | — |
| Phase 7: US5 PWA & Chrome Guard | T051–T056 (6 tasks) | US5 P5 | T051, T052 [P] |
| Phase 8: US6 Export/Backup/Restore | T057–T064 (8 tasks) | US6 P6 | T057–T060 all [P] |
| Phase 9: Polish | T065–T072 (8 tasks) | — | T065, T066, T069, T070 [P] |
| **Total** | **72 tasks** | | |

- **Total tasks**: 72
- **Parallel tasks**: 34 tasks marked [P]
- **MVP scope**: Phases 1–3 (34 tasks) → fully working transaction recording
- **Full delivery**: All 9 phases
