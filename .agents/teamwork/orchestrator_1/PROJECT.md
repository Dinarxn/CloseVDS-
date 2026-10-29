# Project: CloseVDS Master UI Redesign (Phases 2C–2F + Final QA)
Branch: closebds-premium-monochrome-redesign

## Architecture
- Tech Stack: Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- Design Language: Obsidian Precision Monochrome foundation (Phase 2A/2B tokens: `--surface-canvas`, `--surface-panel`, `--surface-card`, `--surface-card-hover`, `--surface-elevated`; 1px precision borders; platinum/carbon typography; restrained semantic status accents; tabular figures for numbers).
- Invariants:
  1. Protected calling paths (`app/(dashboard)/calling/**`, `components/calling/**`, `types/calling.ts`, calling APIs in `lib/api-client.ts`, backend voice modules) strictly untouched.
  2. Backend routes, Prisma schema, services, migrations strictly untouched.
  3. Lead deletion explicit confirmation (`api.leads.delete(id)`), CSV duplicate accounting, and preview behavior strictly preserved.
  4. Email dispatch safeguards remain disabled by default with approval controls intact.
  5. Git state: stay on branch, do not commit, push, merge, or stage files.

## Code Layout & Workstream Ownership Boundaries
| Workstream | Subagent Role | Exclusively Owned Paths | Prohibited Paths |
|------------|---------------|--------------------------|-------------------|
| **R1** | `worker_r1_auth_landing` | `app/page.tsx`, `components/landing/**`, `app/(auth)/**`, `components/auth/**` | Calling paths, backend, other dashboard pages |
| **R2** | `worker_r2_leads` | `app/(dashboard)/leads/**`, `components/leads/**` | Calling paths, backend, shared UI, auth |
| **R3** | `worker_r3_crm_ops` | `app/(dashboard)/crm/**`, `components/crm/**`, `app/(dashboard)/operations/**`, `components/operations/**` | Calling paths, backend, shared UI, leads |
| **R4** | `worker_r4_outreach_analytics` | `app/(dashboard)/outreach/**`, `components/outreach/**`, `app/(dashboard)/analytics/**`, `components/analytics/**`, `app/(dashboard)/settings/**`, `components/settings/**` | Calling paths, backend, shared UI, CRM |
| **R5** | `worker_r5_design_qa` | `components/ui/**`, `app/globals.css`, QA scripts/verification execution | Calling paths, backend, domain business logic |

## Feature Inventory
| # | Feature | Scope | Subagent | Status |
|---|---------|-------|----------|--------|
| 1 | Public Landing Page Redesign | Hero, product positioning, CTA hierarchy, features, trust presentation, professional footer, desktop-first, honest metrics | worker_r1 | PLANNED |
| 2 | Auth Experience Redesign | Login, Register, Forgot Password, Reset Password; consistent card layout, input spacing, error states, preserved providers | worker_r1 | PLANNED |
| 3 | Leads Workspace Redesign | Table density, toolbar, filters, search, pagination, badges, hover states, empty/loading states | worker_r2 | PLANNED |
| 4 | Lead Modals Redesign | Discovery modal, import modal (preserving CSV duplicate math & preview), lead details modal, irreversible deletion confirmation | worker_r2 | PLANNED |
| 5 | CRM Pipeline Redesign | Stage headers, deal cards, pipeline filters, stage counts, action controls, deal transitions | worker_r3 | PLANNED |
| 6 | Operations Workspace Redesign | Follow-up lists, due-state indicators, task tabs, high data density readability | worker_r3 | PLANNED |
| 7 | Outreach Workspace Redesign | Campaign workspace, message composer, queue tabs, safety controls, disabled-by-default dispatch | worker_r4 | PLANNED |
| 8 | Analytics Workspace Redesign | KPI cards, chart hierarchy, filters, date range selection, export controls | worker_r4 | PLANNED |
| 9 | Settings Workspace Redesign | Consistent sections, toggles, forms, security controls, destructive action dialogs | worker_r4 | PLANNED |
| 10 | Design System & QA Verification | Token consistency, shared primitives in `components/ui/**`, `globals.css`, typecheck, lint, build, diff checks, browser smoke tests | worker_r5 | PLANNED |

## Quality Gate Checklist
- [ ] `npm run typecheck` zero errors
- [ ] `npm run lint` passes or documented
- [ ] `npm run build` succeeds
- [ ] `git diff --check` passes cleanly
- [ ] Calling files verified untouched
- [ ] 13-section walkthrough report compiled
