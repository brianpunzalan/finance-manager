<!--
SYNC IMPACT REPORT
==================
Version change: 2.0.0 → 2.1.0
Modified principles:
  - Added: VI. Offline-First
  - Added: VII. PWA Installability
Governance gates updated: Gate 6 (Offline) and Gate 7 (PWA) added
Architecture Constraints updated: offline-readiness note added
Templates checked:
  ✅ .specify/templates/plan-template.md — Constitution Check gates updated (Gate 6, Gate 7 added)
  ✅ .specify/templates/spec-template.md — no structural changes required
  ✅ .specify/templates/tasks-template.md — no structural changes required
Deferred items: None
-->

# Finance Manager Constitution

## Core Principles

### I. Spec-as-Source (NON-NEGOTIABLE)

No feature is designed, planned, or coded without an approved spec in `.specify/specs/`.
The specification is the authoritative definition of intent. Implementation MUST match
the spec; if reality diverges, the spec is amended first, not worked around.

- Every feature begins with `/speckit-specify` and requires an approved `spec.md` before
  `/speckit-plan` runs.
- Code that has no corresponding spec entry MUST NOT be merged.
- Amendments to requirements go through spec revision, not ad-hoc code changes.

### II. Data Integrity First

Financial data is the core asset of this application. Correctness and durability of
financial records MUST take precedence over convenience, performance, or development speed.

- All mutations to financial records (transactions, balances, budgets) MUST be atomic.
- No silent data loss is permitted under any failure mode; errors MUST surface explicitly.
- Data migrations MUST be reversible or have a documented, tested rollback path.

### III. Security & Privacy by Default

Financial data is sensitive. Protective measures are not optional add-ons.

- All user financial data MUST be scoped to the owning user; cross-user data access is
  a critical bug.
- Credentials, tokens, and secrets MUST never be committed to the repository.
- Input from users or external systems MUST be validated at system boundaries before use.
- Dependencies MUST be reviewed for known CVEs before introduction.

### IV. Simplicity over Cleverness

Finance logic is complex enough on its own; the codebase MUST not add unnecessary complexity.

- YAGNI: build only what the current spec requires.
- Prefer standard library and well-established dependencies over custom implementations.
- Three similar lines is preferable to a premature abstraction.
- Complexity that violates this principle MUST be justified in the plan's Complexity
  Tracking table before implementation.

### V. Accessibility (WAI-ARIA Compliance)

All UI components MUST be usable by people relying on assistive technologies. Accessibility
is a first-class requirement, not a post-implementation audit item.

- Every interactive component MUST carry correct ARIA roles, states, and properties
  (e.g., `role`, `aria-label`, `aria-expanded`, `aria-live` where applicable).
- Keyboard navigation MUST be fully functional without a pointing device.
- Focus order MUST follow a logical reading sequence; focus MUST never be trapped
  unintentionally.
- Dynamic content changes (e.g., balance updates, alerts) MUST use appropriate
  `aria-live` regions so screen readers announce them.
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text (WCAG 2.1 AA).
- Accessibility MUST be verified during plan review (Constitution Check Gate 5) and
  again at implementation completion.

### VI. Offline-First

The application MUST remain fully functional without a network connection. Connectivity
is a progressive enhancement, not a prerequisite.

- All core financial operations (create, read, update, delete transactions, view budgets
  and balances) MUST work entirely offline using local storage.
- Every feature spec MUST document its offline behaviour and conflict-resolution strategy
  before a plan is approved.
- Data written offline MUST be durably persisted locally (e.g., IndexedDB or equivalent)
  so it survives page reloads and browser restarts.
- When connectivity is restored, local changes MUST sync to any remote backend without
  data loss; sync conflicts MUST be resolved deterministically and surfaced to the user
  when ambiguous.
- UI MUST clearly indicate the current connectivity state and the sync status of
  pending local changes.

### VII. PWA Installability

The application MUST meet the browser's PWA installability criteria so users can add it
to their home screen or desktop and run it in a standalone window.

- A valid Web App Manifest (`manifest.json`) MUST be present with at minimum: `name`,
  `short_name`, `start_url`, `display: standalone`, `background_color`, `theme_color`,
  and at least one maskable icon at 512×512.
- A Service Worker MUST be registered and MUST implement a cache-first strategy for all
  app shell assets and a network-first (falling back to cache) strategy for API calls.
- The application MUST be served over HTTPS (or localhost for development).
- The install prompt MUST be surfaced in-app at an appropriate moment; it MUST NOT
  appear on every page load.
- Lighthouse PWA audit score MUST be 100 before a feature is considered shippable.

## Architecture Constraints

- **Tech stack** is decided per-feature in `plan.md`, not in the constitution.
  However, all stack choices MUST be justified against Principles II, IV, VI, and VII.
- **No shared mutable global state** in business logic; side effects are explicit.
- **API contracts** (in `contracts/`) are the boundary between components; they MUST
  be versioned and backward-compatible within a major version.
- **Local-first data layer**: the canonical data store during a session is the local
  database (IndexedDB or equivalent); any remote backend is a sync target, not the
  source of truth for reads.

## Governance

- This constitution supersedes all other development guidelines when conflicts arise.
- Amendments require: documented rationale, updated version number, and a migration note
  for any existing specs or plans affected.
- All spec and plan reviews MUST verify compliance with Principles I–VII before approval.
- Constitution Check in `plan-template.md` gates are derived from Principles I–VII:
  - Gate 1 (Spec-as-Source): approved `spec.md` exists for this feature.
  - Gate 2 (Data Integrity): mutations are atomic; rollback path documented.
  - Gate 3 (Security): data scoping verified; no secrets in code; inputs validated.
  - Gate 4 (Simplicity): Complexity Tracking table completed for any principle violation.
  - Gate 5 (Accessibility): ARIA roles/states specified in plan; keyboard nav documented.
  - Gate 6 (Offline-First): offline behaviour and conflict-resolution strategy documented
    in spec before plan approval.
  - Gate 7 (PWA): manifest, service worker strategy, and Lighthouse target documented
    in plan before implementation starts.

**Version**: 2.1.0 | **Ratified**: 2026-05-04 | **Last Amended**: 2026-05-04
