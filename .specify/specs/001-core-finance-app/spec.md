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

A user on a supported mobile or desktop browser is prompted to install the app to their
home screen or desktop. Once installed, the app opens in a standalone window and all
core features work without an internet connection.

**Why this priority**: Offline use and installability are constitutional requirements
but are experienced as a layer on top of the already-working journaling features.

**Independent Test**: Can be fully tested by installing via the browser's install prompt
and confirming the app launches standalone, and that adding a transaction while the
device is in airplane mode persists after reconnecting.

**Acceptance Scenarios**:

1. **Given** the user visits the app in a PWA-capable browser for the first time,
   **When** the browser determines the install criteria are met, **Then** an in-app
   install prompt appears at an appropriate moment (not on every page load).

2. **Given** the app is installed, **When** the user launches it from their home screen
   or desktop, **Then** it opens in a standalone window with no browser chrome.

3. **Given** the device has no network connection, **When** the user opens the installed
   app and records a transaction, **Then** the transaction is saved and visible
   immediately without requiring any network access.

4. **Given** the app is offline and the user navigates between screens, **When** they
   access any core feature (transaction list, form, settings), **Then** all screens
   load and function correctly.

---

### Edge Cases

- What happens when the user clears browser site data? All locally stored data is
  permanently lost; the app resets to an empty state with default categories and a
  default account. This is expected behaviour and documented in the UI.
- What if the user adds a transaction with the same title and time as an existing one?
  Duplicate entries are allowed — deduplication is the user's responsibility.
- What if the browser's storage quota is exceeded? The app surfaces an error explaining
  that local storage is full and suggests the user export or delete older entries.
- How does the app behave when categories or accounts lists are empty? For income/expense,
  the transaction form disables submission and guides the user to Settings to create at
  least one category and one account. For transfers, at least two accounts are required.
- What if the user edits a transfer and sets both accounts to the same value? The form
  applies the same same-account validation as on creation and rejects the save.
- What if an account involved in a transfer is deleted? The transfer is reassigned to
  the "General" fallback for the affected side (source or destination), preserving the
  transaction record.

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
- **FR-014**: All data MUST be stored entirely within the user's browser; no financial
  data is ever transmitted over a network.
- **FR-015**: Application MUST be accessible without any login, registration, or
  authentication step.
- **FR-016**: Application MUST be installable as a PWA on supported browsers.
- **FR-017**: All features MUST work fully when the device has no network connection.
- **FR-018**: All interactive UI components MUST comply with WAI-ARIA standards,
  support keyboard navigation, and meet WCAG 2.1 AA contrast requirements.
- **FR-019**: Settings MUST include a currency selector. The user MUST be able to change
  the active currency at any time. Changing the currency updates all displayed amounts
  immediately; stored decimal values are not altered.

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
- **SC-003**: The app is installable on at least two major platforms (e.g., Android
  Chrome and desktop Chrome/Edge) and launches in standalone mode from the home
  screen or desktop.
- **SC-004**: Every core user action (record income/expense/transfer, view, edit, delete
  transaction; manage categories; manage accounts) completes successfully with no network
  connection.
- **SC-005**: Zero bytes of user financial data leave the device during normal
  operation.
- **SC-006**: Settings changes (adding, renaming, or deleting a category or account)
  are reflected in the transaction form without requiring a page reload.
- **SC-007**: All interactive elements are operable by keyboard alone and are
  announced correctly by a screen reader.

## Assumptions

- Single-user application; no data sharing, sync to cloud, or multi-device support
  in this version.
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
- No data export, import, or backup feature is in scope for this version.
- Browser storage quota limits are the effective data cap; no custom quota management
  beyond surfacing a clear error when the limit is reached.
- Date/time is stored and displayed in the user's local timezone as reported by the
  browser.
