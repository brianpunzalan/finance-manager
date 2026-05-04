<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Modified principles:
  - Removed: III. Test-First (NON-NEGOTIABLE) — automated tests are not required by this project
  - Renamed: IV. Security & Privacy by Default → III. Security & Privacy by Default
  - Renamed: V. Simplicity over Cleverness → IV. Simplicity over Cleverness
  - Added: V. Accessibility (WAI-ARIA Compliance)
Governance gates updated: Gate 3 (Test-First) removed; Gate 5 added (Accessibility)
Templates checked:
  ✅ .specify/templates/plan-template.md — Constitution Check gates updated (Gate 3 removed, Gate 5 added)
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

## Architecture Constraints

- **Tech stack** is decided per-feature in `plan.md`, not in the constitution.
  However, all stack choices MUST be justified against Principles II and IV.
- **No shared mutable global state** in business logic; side effects are explicit.
- **API contracts** (in `contracts/`) are the boundary between components; they MUST
  be versioned and backward-compatible within a major version.

## Governance

- This constitution supersedes all other development guidelines when conflicts arise.
- Amendments require: documented rationale, updated version number, and a migration note
  for any existing specs or plans affected.
- All spec and plan reviews MUST verify compliance with Principles I–V before approval.
- Constitution Check in `plan-template.md` gates are derived from Principles I–V:
  - Gate 1 (Spec-as-Source): approved `spec.md` exists for this feature.
  - Gate 2 (Data Integrity): mutations are atomic; rollback path documented.
  - Gate 3 (Security): data scoping verified; no secrets in code; inputs validated.
  - Gate 4 (Simplicity): Complexity Tracking table completed for any principle violation.
  - Gate 5 (Accessibility): ARIA roles/states specified in plan; keyboard nav documented.

**Version**: 2.0.0 | **Ratified**: 2026-05-04 | **Last Amended**: 2026-05-04
