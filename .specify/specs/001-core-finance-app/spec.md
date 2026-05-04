# Feature Specification: Core Finance App

**Feature Branch**: `001-core-finance-app`
**Created**: 2026-05-04
**Status**: Draft
**Input**: User description: public, offline-first, PWA-installable personal finance journaling app with income/expense transactions, configurable categories and accounts, no authentication required.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Record a Financial Transaction (Priority: P1)

A user opens the app and fills in the transaction form to log money they spent or received.
They choose whether it is an expense or income, pick a category and account, enter the
amount, add a title and optional note, and confirm the date and time. On submission the
entry is saved to the device and immediately visible.

**Why this priority**: This is the single most fundamental action in the app. Everything
else depends on transactions existing.

**Independent Test**: Can be fully tested by submitting the form with valid data and
confirming the entry appears in the transaction list — no other story needs to be
complete first.

**Acceptance Scenarios**:

1. **Given** the user is on the home screen, **When** they open the transaction form and
   fill in all required fields (type, title, amount, category, account, date/time) and
   submit, **Then** the new transaction appears at the top of the transaction list and
   all field values are preserved exactly as entered.

2. **Given** a transaction form is open, **When** the user submits without filling a
   required field, **Then** the form displays a clear inline error for each missing
   field and the transaction is not saved.

3. **Given** the user enters a non-positive amount (zero or negative), **When** they
   attempt to submit, **Then** the form rejects the input with an error message
   indicating amount must be greater than zero.

4. **Given** no categories exist yet, **When** the user opens the transaction form,
   **Then** the category field prompts the user to add a category in Settings before
   a transaction can be recorded.

5. **Given** the device has no network connection, **When** the user submits a
   transaction, **Then** the entry is saved locally and a connectivity indicator
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
   list, **Then** all entries are displayed in reverse chronological order showing at
   minimum: title, amount, type (income/expense), category, and date.

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
- How does the app behave when categories or accounts lists are empty? The transaction
  form disables submission and guides the user to Settings to create at least one
  category and one account before recording.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to record a transaction with all of the following
  fields: title (text), amount (positive decimal number), note (optional text),
  category (selected from configured list), account (selected from configured list),
  transaction type (income or expense), and date/time.
- **FR-002**: Date/time field MUST default to the current date and time but MUST be
  editable by the user.
- **FR-003**: System MUST display all recorded transactions in reverse chronological
  order showing title, amount, type, category, account, and date.
- **FR-004**: Users MUST be able to edit any field of an existing transaction and save
  the changes.
- **FR-005**: Users MUST be able to delete a transaction after an explicit confirmation
  step.
- **FR-006**: System MUST provide a Settings section where users can manage categories
  and accounts independently.
- **FR-007**: Categories MUST have a name and a type: expense, income, or both.
- **FR-008**: Accounts MUST have at minimum a name.
- **FR-009**: Deleting a category MUST reassign all affected transactions to an
  "Uncategorized" system fallback; the fallback MUST NOT be deletable.
- **FR-010**: Deleting an account MUST reassign all affected transactions to a "General"
  system fallback account; the fallback MUST NOT be deletable.
- **FR-011**: All data MUST be stored entirely within the user's browser; no financial
  data is ever transmitted over a network.
- **FR-012**: Application MUST be accessible without any login, registration, or
  authentication step.
- **FR-013**: Application MUST be installable as a PWA on supported browsers.
- **FR-014**: All features MUST work fully when the device has no network connection.
- **FR-015**: All interactive UI components MUST comply with WAI-ARIA standards,
  support keyboard navigation, and meet WCAG 2.1 AA contrast requirements.

### Key Entities

- **Transaction**: Represents a single financial entry. Has a unique identifier, title,
  positive decimal amount, optional note, transaction type (income or expense),
  reference to a category, reference to an account, and an exact date and time.
- **Category**: A named grouping label for transactions. Has a unique identifier, a
  user-defined name, and a type (expense, income, or both). Two system categories
  exist by default and cannot be deleted: "Uncategorized" (expense/both) and
  "General Income" (income/both).
- **Account**: A named financial account or wallet the user tracks. Has a unique
  identifier and a user-defined name. One system account exists by default and cannot
  be deleted: "General".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can record a complete financial transaction from opening the form
  to confirmation in under 60 seconds.
- **SC-002**: All recorded transactions persist and remain fully accessible after
  closing and reopening the browser or relaunching the installed app.
- **SC-003**: The app is installable on at least two major platforms (e.g., Android
  Chrome and desktop Chrome/Edge) and launches in standalone mode from the home
  screen or desktop.
- **SC-004**: Every core user action (record, view, edit, delete transaction; manage
  categories; manage accounts) completes successfully with no network connection.
- **SC-005**: Zero bytes of user financial data leave the device during normal
  operation.
- **SC-006**: Settings changes (adding, renaming, or deleting a category or account)
  are reflected in the transaction form without requiring a page reload.
- **SC-007**: All interactive elements are operable by keyboard alone and are
  announced correctly by a screen reader.

## Assumptions

- Single-user application; no data sharing, sync to cloud, or multi-device support
  in this version.
- A single currency is used throughout; no multi-currency or currency conversion.
- "Account" in this version is a named label only (e.g., "Cash", "Savings"); there
  is no balance tracking, opening balance, or reconciliation feature.
- The app ships with a small set of default categories (e.g., "Food", "Transport",
  "Salary", "Freelance") and one default account ("General") to ensure the transaction
  form is usable immediately after install.
- No data export, import, or backup feature is in scope for this version.
- Browser storage quota limits are the effective data cap; no custom quota management
  beyond surfacing a clear error when the limit is reached.
- Date/time is stored and displayed in the user's local timezone as reported by the
  browser.
