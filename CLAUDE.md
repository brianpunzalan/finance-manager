# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`finance-manager` — a greenfield project using **Spec-Driven Development** via [github/spec-kit](https://github.com/github/spec-kit). Specs are the source of truth; implementations are derived from them, not the other way around.

## Spec-Kit Workflow

This project follows the spec-as-source methodology. The canonical order is:

1. `/speckit-constitution` — establish governing principles in `.specify/memory/constitution.md`
2. `/speckit-specify` — write functional requirements → produces `.specify/specs/<id>-<name>/spec.md`
3. `/speckit-clarify` *(optional)* — structured Q&A to de-risk ambiguity before planning
4. `/speckit-plan` — generate tech plan → produces `plan.md`, `data-model.md`, `contracts/`
5. `/speckit-checklist` *(optional)* — validate requirements completeness after planning
6. `/speckit-analyze` *(optional)* — cross-artifact consistency check before tasking
7. `/speckit-tasks` — break plan into ordered tasks → produces `tasks.md`
8. `/speckit-implement` — execute tasks in dependency order

All skills live in `.claude/skills/speckit-*/SKILL.md`.

## Repository Layout

```
.specify/
  memory/constitution.md     # Project governing principles (fill this in first)
  specs/<id>-<name>/         # One directory per feature
    spec.md / plan.md / tasks.md / data-model.md / research.md
    contracts/               # API contracts (OpenAPI, SignalR, etc.)
  templates/                 # Spec/plan/tasks/checklist templates
  scripts/bash/              # Helper scripts (create-new-feature.sh, setup-plan.sh, etc.)
  workflows/speckit/         # Full SDD cycle workflow definition
.claude/skills/              # Claude Code skill definitions installed by spec-kit
```

## Key Constraints

- Always read the active `plan.md` for the current spec before writing code — the `<!-- SPECKIT START/END -->` block in CLAUDE.md points there.
- The constitution (`.specify/memory/constitution.md`) supersedes all other practices once filled in. Check it before making architectural decisions.
- Specs live under `.specify/specs/` using sequential numbering (`001-`, `002-`, …).

<!-- SPECKIT START -->
Active feature: **001-core-finance-app**
Read the implementation plan before writing any code:
`.specify/specs/001-core-finance-app/plan.md`

Key artifacts:
- Spec: `.specify/specs/001-core-finance-app/spec.md`
- Data model: `.specify/specs/001-core-finance-app/data-model.md`
- CSV schema: `.specify/specs/001-core-finance-app/contracts/csv-schema.md`
- Quickstart: `.specify/specs/001-core-finance-app/quickstart.md`
<!-- SPECKIT END -->
