# Feature Specification: Core Finance App

**Feature Branch**: `001-core-finance-app`
**Created**: 2026-05-04
**Amended**: 2026-05-04 — added transfer transaction type (three types: income, expense, transfer)
**Status**: Draft
**Input**: User description: public, offline-first, PWA-installable personal finance journaling app with income/expense/transfer transactions, configurable categories and accounts, no authentication required.

## Clarifications

### Session 2026-05-04

- Q: How should currency be handled — fixed locale, device locale, or user-configurable? → A: Currency is a user-configurable setting in Settings that can be changed at any time.
- Q: Which default seed categories ship with the app? → A: A richer preset list of ~15 categories covering both expense and income types.
- Q: Should the transaction list support filtering or search? → A: Filter by type (income/expense/transfer), account, category, and date range, plus free-text search on title and note.
- Constraint (user-specified): All application data MUST be stored in IndexedDB specifically, not localStorage or any other browser storage mechanism.
- Q: How should the app handle corrupt/unreadable IndexedDB data on load? → A: Show a clear error screen, block all further writes, and guide the user to restore from a backup file. Only if no backup exists, offer a "Start fresh" option behind an explicit double-confirmation. No silent reset.
- Q: How should partial writes be prevented? → A: All IndexedDB mutations MUST use transactions; if a transaction fails it MUST roll back in full and surface an error.
- Q: How should iOS storage eviction be mitigated? → A: Request persistent storage permission (`navigator.storage.persist()`) on first launch. If granted, storage is protected. If denied or unavailable, show a persistent notice warning the user and recommending PWA installation for stronger storage guarantees.
- Q: When does the scheduled export trigger, and which mechanism? → A: Trigger on app open when the interval has elapsed and show a non-blocking toast confirming the backup ran. Additionally, attempt Periodic Background Sync API on Chrome installations that support it, falling back to on-open trigger otherwise.
- Scope constraint (user-specified): The application targets Chrome (desktop and Android) only. All other browsers MUST receive an unsupported-browser error page. PWA installability MUST work on Android Chrome specifically.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Record a Financial Transaction (Priority: P1)

A user opens the app and fills in the transaction form to log money they spent, received,
or moved between accounts. They choose the transaction type — income, expense, or transfer
— and the form adapts to show the relevant fields. For income and expense, the user picks
a single account and a category. For a transfer, the user picks a source account and a
destination account; category is optional. On submission the entry is saved to the device
and immediately visible.

**Why this priority**: This is the single most fundamental action in the app. Everything
else depends on transactions existing. Transfer is included at P1 because it is a core
transaction type, not an add-on.

**Independent Test**: Can be fully tested by submitting one of each type (income, expense,
transfer) with valid data and confirming each appears in the transaction list with the
correct fields displayed — no other story needs to be complete first.

**Acceptance Scenarios**:

1. **Given** the user selects the "expense" or "income" type, **When** they fill in all
   required fields (title, amount, category, account, date/time) and submit, **Then** the
   new transaction appears at the top of the transaction list with all values preserved.

2. **Given** the user selects the "transfer" type, **When** they fill in all required
   fields (title, amount, source account, destination account, date/time) and submit,
   **Then** the transfer appears in the transaction list showing the source and destination
   accounts, and category is not required.

3. **Given** the user selects "transfer" and chooses the same account for both source and
   destination, **When** they attempt to submit, **Then** the form rejects the entry with
   a clear error stating source and destination accounts must be different.

4. **Given** only one account exists, **When** the user selects the "transfer" type,
   **Then** the form disables submission and prompts the user to add at least one more
   account in Settings before a transfer can be recorded.

5. **Given** a transaction form is open, **When** the user submits without filling a
   required field, **Then** the form displays a clear inline error for each missing
   field and the transaction is not saved.

6. **Given** the user enters a non-positive amount (zero or negative), **When** they
   attempt to submit, **Then** the form rejects the input with an error message
   indicating amount must be greater than zero.

7. **Given** no categories exist yet and the user selects "income" or "expense" type,
   **When** they open the transaction form, **Then** the category field prompts the user
   to add a category in Settings before the transaction can be recorded.

8. **Given** the device has no network connection, **When** the user submits any
   transaction type, **Then** the entry is saved locally and a connectivity indicator
   confirms the data is stored on-device.

---

### User Story 2 — View and Manage Transaction History (Priority: P2)

A user can browse all recorded transactions in reverse chronological order and may
edit or delete any entry.

**Why this priority**: Without visibility into past entries the journaling purpose is
lost. Edit and delete are required to correct mistakes.

**Independent Test**: Can be fully tested by verifying that submitted transactions
appear listed, that tapping an entry opens an editable form pre-filled with existing
values, and that deleting an entry removes it from the list — requires only US1 to
have transactions to act on.

**Acceptance Scenarios**:

1. **Given** transactions have been recorded, **When** the user views the transaction
   list, **Then** all entries are displayed in reverse chronological order. Income and
   expense entries show: title, amount, type, category, account, and date. Transfer
   entries show: title, amount, source account → destination account, and date.

2. **Given** the transaction list is visible, **When** the user selects an entry,
   **Then** the transaction form opens pre-filled with the existing values and the user
   can modify any field and save the changes.

3. **Given** an entry is selected for editing, **When** the user saves changes,
   **Then** the list reflects the updated values immediately.

4. **Given** an entry is selected, **When** the user chooses to delete it and confirms,
   **Then** the entry is permanently removed from the list and the total count
   decreases by one.

5. **Given** no transactions exist, **When** the user views the transaction list,
   **Then** an empty-state message guides them to record their first transaction.

6. **Given** the transaction list is visible, **When** the user applies one or more
   filters (type, account, category, date range) or enters text in the search field,
   **Then** the list updates immediately to show only matching entries.

7. **Given** filters or search are active, **When** no transactions match, **Then** a
   clear empty-state message indicates no results for the current filters, with an
   option to clear them.

8. **Given** filters or search are active, **When** the user clears all filters,
   **Then** the full transaction list is restored.

---

### User Story 3 — Configure Categories (Priority: P3)

A user can manage the list of categories available for transactions. Categories are
typed as income, expense, or both. The user can add new categories, rename existing
ones, and remove categories they no longer need.

**Why this priority**: Categories are a prerequisite for US1 but can be seeded with
defaults; making them configurable is a distinct, lower-priority story.

**Independent Test**: Can be fully tested within Settings by adding, renaming, and
removing a category and confirming the category picker in the transaction form updates
accordingly.

**Acceptance Scenarios**:

1. **Given** the user is in Settings → Categories, **When** they add a new category
   with a name and type, **Then** it appears in the category list and becomes available
   in the transaction form immediately.

2. **Given** an existing category, **When** the user renames it, **Then** the new name
   is reflected in the Settings list and in all existing transactions that used it.

3. **Given** a category that is assigned to one or more transactions, **When** the user
   deletes it, **Then** the system reassigns those transactions to an "Uncategorized"
   fallback and the deleted category no longer appears in the picker.

4. **Given** the user tries to save a category with an empty name, **Then** the form
   rejects the input with a validation message.

---

### User Story 4 — Configure Accounts (Priority: P4)

A user can manage the list of accounts (e.g., "Cash", "Savings", "Credit Card") that
transactions are associated with. The user can add, rename, and remove accounts.

**Why this priority**: Accounts add organizational depth but the app is usable with a
single default account; making them configurable is lower priority than core journaling.

**Independent Test**: Can be fully tested within Settings → Accounts by adding,
renaming, and removing an account and confirming the account picker in the transaction
form updates accordingly.

**Acceptance Scenarios**:

1. **Given** the user is in Settings → Accounts, **When** they add a new account with
   a name, **Then** it appears in the account list and becomes available in the
   transaction form immediately.

2. **Given** an existing account, **When** the user renames it, **Then** the new name
   is reflected in the Settings list and on all transactions assigned to that account.

3. **Given** an account assigned to one or more transactions, **When** the user deletes
   it, **Then** those transactions are reassigned to a "General" fallback account and
   the deleted account no longer appears in the picker.

4. **Given** the user tries to save an account with an empty name, **Then** the form
   rejects the input with a validation message.

---

### User Story 5 — Install and Use Offline as PWA (Priority: P5)

A user on Chrome (desktop or Android) is prompted to install the app to their home
screen or desktop. Once installed, the app opens in a standalone window and all core
features work without an internet connection. Users on any other browser see a clear
unsupported-browser page.

**Why this priority**: Offline use and installability are constitutional requirements
but are experienced as a layer on top of the already-working journaling features.
Chrome-only scope simplifies PWA delivery significantly.

**Independent Test**: Can be fully tested on Android Chrome by installing via the
browser install prompt, confirming the app launches standalone, and recording a
transaction in airplane mode.

**Acceptance Scenarios**:

1. **Given** a user opens the app in a browser other than Chrome, **When** the app
   loads, **Then** an unsupported-browser error page is displayed explaining that only
   Chrome (desktop and Android) is supported, with no app functionality accessible.

2. **Given** the user visits the app in Chrome for the first time, **When** the browser
   determines the PWA install criteria are met, **Then** an in-app install prompt
   appears at an appropriate moment (not on every page load).

3. **Given** the app is installed on Android Chrome, **When** the user launches it from
   their home screen, **Then** it opens in a standalone window with no browser chrome.

4. **Given** the device has no network connection, **When** the user opens the installed
   app and records a transaction, **Then** the transaction is saved and visible
   immediately without requiring any network access.

5. **Given** the app is offline and the user navigates between screens, **When** they
   access any core feature (transaction list, form, settings), **Then** all screens
   load and function correctly.

---

### User Story 6 — Export, Backup & Restore (Priority: P6)

A user can export all their financial data as a CSV file, either on demand or on a
recurring schedule. Ad-hoc exports may be saved locally (browser download) or sent to
the user's Google Drive. Scheduled exports are sent automatically to Google Drive at a
configured interval. The user may restore their data at any time by importing a
previously exported CSV backup file.

**Why this priority**: Export and restore protect against data loss from browser
eviction, storage corruption, or accidental deletion. Required as the sole recovery
mechanism given the app has no server backup.

**Independent Test**: Can be fully tested by exporting data to a local download, clearing
all app data, then restoring from the downloaded file and confirming all original records
are present.

**Acceptance Scenarios**:

1. **Given** the user is in Settings → Backup & Export, **When** they choose "Export now"
   and select "Download to device", **Then** a CSV file is downloaded via the browser
   containing all transactions, categories, and accounts in the agreed schema.

2. **Given** the user is in Settings → Backup & Export, **When** they choose "Export now"
   and select "Save to Google Drive", **Then** the app requests Google Drive authorisation
   (if not already granted), and saves the CSV file to the user's Drive in a designated
   app folder.

3. **Given** the user has configured a scheduled backup, **When** the app is opened and
   the scheduled interval has elapsed, **Then** the app automatically exports a CSV to
   Google Drive and notifies the user that a backup was saved.

4. **Given** the user is in Settings → Backup & Export and chooses "Restore from backup",
   **When** they select a valid CSV backup file, **Then** the app presents a confirmation
   screen showing the record count to be restored and warns that existing data will be
   replaced, before proceeding.

5. **Given** a restore operation is confirmed, **When** the import completes successfully,
   **Then** all transactions, categories, and accounts from the backup file are present
   in the app and the previous data is gone.

6. **Given** the app detects corrupt or unreadable IndexedDB data on load, **When** the
   error screen is shown, **Then** a prominent "Restore from backup" action is available;
   if no backup exists, a "Start fresh" action is offered behind a double-confirmation.

7. **Given** a backup CSV file with an unrecognised or invalid format is selected,
   **When** the user attempts to restore, **Then** the app rejects the file with a clear
   error message and leaves existing data untouched.

---

### Edge Cases

- What happens when the user clears browser site data? All data stored in IndexedDB is
  permanently lost; the app resets to an empty state with default categories and a
  default account. This is expected behaviour and documented in the UI.
- What if the user adds a transaction with the same title and time as an existing one?
  Duplicate entries are allowed — deduplication is the user's responsibility.
- What if the browser's IndexedDB quota is exceeded? The app surfaces an error explaining
  that on-device storage is full and suggests the user delete older entries or export
  a backup.
- How does the app behave when categories or accounts lists are empty? For income/expense,
  the transaction form disables submission and guides the user to Settings to create at
  least one category and one account. For transfers, at least two accounts are required.
- What if the user edits a transfer and sets both accounts to the same value? The form
  applies the same same-account validation as on creation and rejects the save.
- What if an account involved in a transfer is deleted? The transfer is reassigned to
  the "General" fallback for the affected side (source or destination), preserving the
  transaction record.
- What if the user opens the app in Firefox, Safari, Edge, or any non-Chrome browser?
  An unsupported-browser error page is displayed immediately; no app functionality is
  rendered.
- What if IndexedDB data is corrupt or unreadable on app load (e.g., schema mismatch
  after an update, interrupted write, or browser-level corruption)? The app shows a
  clear error screen, blocks all further writes to prevent overwriting salvageable data,
  and guides the user to restore from a backup file. If no backup exists, a "Start fresh"
  option is available behind an explicit double-confirmation warning.
- What if an IndexedDB write transaction fails mid-operation? The transaction is rolled
  back in full; no partial data is committed. The error is surfaced to the user
  immediately with a prompt to retry.
- What if the OS evicts IndexedDB data under storage pressure (particularly on iOS
  Safari)? On first launch the app requests persistent storage permission via the
  Storage Persistence API. If granted, eviction is prevented. If denied or the API is
  unavailable, the app displays a persistent notice warning the user that data may be at
  risk and recommending PWA installation ("Add to Home Screen"), which provides stronger
  storage durability guarantees on iOS.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support three transaction types: income, expense, and transfer.
- **FR-002**: For income and expense transactions, the system MUST require: title (text),
  amount (positive decimal), category (from configured list), account (from configured
  list), date/time. Note is optional.
- **FR-003**: For transfer transactions, the system MUST require: title (text), amount
  (positive decimal), source account, destination account, date/time. Category and note
  are optional for transfers.
- **FR-004**: Source account and destination account on a transfer MUST be different;
  the system MUST reject any transfer where they are the same.
- **FR-005**: Date/time field MUST default to the current date and time but MUST be
  editable by the user.
- **FR-006**: System MUST display all recorded transactions in reverse chronological
  order. Income/expense entries show title, amount, type, category, account, and date.
  Transfer entries show title, amount, source account, destination account, and date.
- **FR-007**: Users MUST be able to edit any field of an existing transaction and save
  the changes. Editing a transfer MUST re-apply the same-account validation.
- **FR-008**: Users MUST be able to delete a transaction after an explicit confirmation
  step.
- **FR-009**: System MUST provide a Settings section where users can manage categories
  and accounts independently.
- **FR-010**: Categories MUST have a name and a type: expense, income, or both.
  Categories are not applicable to transfer transactions.
- **FR-011**: Accounts MUST have at minimum a name.
- **FR-012**: Deleting a category MUST reassign all affected income/expense transactions
  to an "Uncategorized" system fallback; the fallback MUST NOT be deletable.
- **FR-013**: Deleting an account MUST reassign all affected transactions — including
  transfers where it appeared as source or destination — to the "General" system fallback;
  the fallback MUST NOT be deletable.
- **FR-014**: All application data MUST be stored in IndexedDB within the user's browser.
  No other client-side storage mechanism (localStorage, sessionStorage, cookies) is
  permitted for financial data, and no financial data is ever transmitted over a network.
- **FR-015**: Application MUST be accessible without any login, registration, or
  authentication step.
- **FR-016**: On load, the application MUST detect the browser. If the browser is not
  Chrome (desktop or Android Chrome), the app MUST display an unsupported-browser
  error page and render no other application functionality.
- **FR-017**: Application MUST be installable as a PWA on Chrome desktop and Android
  Chrome specifically.
- **FR-018**: All features MUST work fully when the device has no network connection.
- **FR-018**: All interactive UI components MUST comply with WAI-ARIA standards,
  support keyboard navigation, and meet WCAG 2.1 AA contrast requirements.
- **FR-019**: The transaction list MUST support filtering by any combination of:
  transaction type (income, expense, transfer), account, category, and date range.
  Filters MUST be combinable (AND logic). A clear-all-filters control MUST be present
  when any filter is active.
- **FR-020**: The transaction list MUST support free-text search across the title and
  note fields. Search MUST be case-insensitive and update results as the user types.
- **FR-021**: Settings MUST include a currency selector. The user MUST be able to change
  the active currency at any time. Changing the currency updates all displayed amounts
  immediately; stored decimal values are not altered.
- **FR-022**: All IndexedDB write operations MUST be wrapped in transactions. If a
  transaction fails for any reason, it MUST roll back completely; no partial state is
  persisted. The error MUST be surfaced to the user with a retry prompt.
- **FR-023**: The app MUST track an internal schema version number in IndexedDB. On
  every launch it MUST compare the stored version to the current app version and run
  any required additive migrations before allowing data access. Schema changes MUST
  never remove or rename existing fields without a migration that preserves all
  previously written records.
- **FR-024**: On first launch, the app MUST request persistent storage permission via
  the browser's Storage Persistence API. If permission is denied or the API is
  unavailable, the app MUST display a persistent notice warning the user that data may
  be at risk and recommending PWA installation.
- **FR-025**: If IndexedDB is unreadable or throws on open, the app MUST display an
  error screen, block all further write operations, and offer a "Restore from backup"
  action as the primary recovery path. A "Start fresh" action MUST be available as a
  last resort only after the user passes an explicit double-confirmation warning.
- **FR-026**: Settings MUST include a Backup & Export section providing:
  (a) Ad-hoc export to local device download (CSV).
  (b) Ad-hoc export to the user's Google Drive (CSV), requiring Google OAuth
      authorisation on first use.
  (c) Scheduled automatic export to Google Drive at a user-configured interval
      (daily, weekly, or monthly). The primary trigger is app open when the interval
      has elapsed, showing a non-blocking toast on completion. On Chrome installations
      that support the Periodic Background Sync API, the app MUST additionally register
      a background sync task so the export can run without the app being open; on
      unsupported installations the on-open trigger serves as the sole mechanism.
- **FR-027**: The CSV export format MUST include all transactions, categories, and
  accounts. The exact schema will be defined at the plan stage.
- **FR-028**: Settings MUST include a "Restore from backup" action that accepts a
  previously exported CSV file. Before restoring, the app MUST display a confirmation
  screen showing the record count and a warning that existing data will be replaced.
  On confirmation, existing data is replaced atomically. If the file is invalid or
  unrecognised, the restore is rejected and existing data is left untouched.

### Key Entities

- **Transaction**: Represents a single financial entry. Has a unique identifier, title,
  positive decimal amount, optional note, transaction type (income, expense, or transfer),
  and an exact date and time.
  - Income/expense transactions additionally reference one category and one account.
  - Transfer transactions additionally reference a source account and a distinct
    destination account; category is optional.
- **Category**: A named grouping label for income and expense transactions. Has a unique
  identifier, a user-defined name, and a type (expense, income, or both). Two system
  categories exist by default and cannot be deleted: "Uncategorized" (expense/both) and
  "General Income" (income/both). Categories do not apply to transfers.
- **Account**: A named financial account or wallet the user tracks. Has a unique
  identifier and a user-defined name. Referenced by income/expense transactions (single
  account) and by transfer transactions (as source and destination). One system account
  exists by default and cannot be deleted: "General".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can record a complete transaction of any type (income, expense, or
  transfer) from opening the form to confirmation in under 60 seconds.
- **SC-002**: All recorded transactions persist and remain fully accessible after
  closing and reopening the browser or relaunching the installed app.
- **SC-003**: The app is installable on Android Chrome and desktop Chrome, and launches
  in standalone mode from the home screen or desktop. Users on any other browser see
  the unsupported-browser error page.
- **SC-004**: Every core user action (record income/expense/transfer, view, edit, delete
  transaction; manage categories; manage accounts) completes successfully with no network
  connection.
- **SC-005**: Zero bytes of user financial data leave the device during normal
  operation.
- **SC-006**: Settings changes (adding, renaming, or deleting a category or account)
  are reflected in the transaction form without requiring a page reload.
- **SC-007**: All interactive elements are operable by keyboard alone and are
  announced correctly by a screen reader.
- **SC-008**: A user can export all data to a local CSV download in under 10 seconds
  regardless of the number of transactions stored.
- **SC-009**: A user can fully restore all data from a valid CSV backup file, with the
  restored record count matching the export, in a single operation.

## Assumptions

- Single-user application; no data sharing, sync to cloud, or multi-device support
  in this version.
- Supported browsers: Chrome (desktop) and Android Chrome only. All other browsers
  are explicitly out of scope and receive an unsupported-browser error page.
- iOS Safari is not a supported browser; the iOS storage eviction mitigation via the
  Storage Persistence API is relevant only when a user accesses the app on Chrome for
  Android, where eviction risk is lower but the API is still requested as a safeguard.
- A single active currency is used throughout the app at any one time; no multi-currency
  or currency conversion. The user selects their currency in Settings and may change it
  at any time. All amounts are stored as plain decimals; the selected currency symbol and
  format are applied at display time only.
- "Account" in this version is a named label only (e.g., "Cash", "Savings"); there
  is no balance tracking, opening balance, or reconciliation feature. Transfers move
  money between labels only — no running balance is computed.
- Transfer transactions are treated as neutral entries (neither income nor expense) and
  are excluded from income/expense category reporting.
- The app ships with the following preset categories and one default account ("General")
  so the transaction form is usable immediately after install. All presets are editable
  and deletable by the user (subject to the fallback rules in FR-012).

  **Expense categories** (type: expense): Food & Drink, Transport, Shopping,
  Bills & Utilities, Health & Medical, Housing & Rent, Entertainment, Education,
  Personal Care, Travel.

  **Income categories** (type: income): Salary, Freelance, Business, Investment,
  Gift & Allowance.
- Export and restore are in scope. Financial data MAY leave the device only via an
  explicit user-initiated export action (local download or Google Drive). Automatic
  background transmission is prohibited. Google Drive integration requires OAuth
  authorisation granted by the user; no financial data is stored server-side by this
  app. The CSV schema will be finalised at the plan stage.
- IndexedDB is the mandated storage mechanism. Browser-imposed IndexedDB quota limits
  are the effective data cap; no custom quota management beyond surfacing a clear error
  when the limit is reached.
- Date/time is stored and displayed in the user's local timezone as reported by the
  browser.
