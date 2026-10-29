# Original User Request

## Initial Request — 2026-10-29T19:17:27Z

Use exactly FIVE specialized subagents for the work assignments below, in addition to yourself as the Lead Coordinator. Complete the remaining premium UI redesign (Phases 2C–2F + final QA) for CloseVDS (an AI Client Acquisition OS) in one coordinated implementation effort on branch `closebds-premium-monochrome-redesign`.

Working directory: c:\Users\Admin\Desktop\CloseBDS OS\CloseBDS Frontend
Integrity mode: development

## Requirements

### R1. Authentication & Landing Experience Redesign
- Visibly redesign the public landing page (`app/page.tsx` and landing components) with a stronger hero section, clear product positioning, polished CTA hierarchy, feature sections, trust-oriented presentation, and professional footer, desktop-first, without inventing fake testimonials, logos, user counts, or metrics.
- Improve Login, Register, Forgot Password, and Reset Password screens (`app/(auth)/**`, `components/auth/**`), standardizing form layout, input spacing, validation feedback, card proportions, and visual hierarchy.
- Preserve existing authentication providers, API integrations, form validation, session handling, redirects, and password-reset behavior.

### R2. Leads, Discovery & Lead Details Workspace Redesign
- Visibly redesign the Leads workspace and data table (`app/(dashboard)/leads/**`, `components/leads/**`), improving page heading, toolbar, search, filters, view controls, pagination, action hierarchy, column alignment, row density, badges, hover states, and empty/loading/error states.
- Redesign the lead discovery modal, import modal, and lead-detail modal for improved scanability.
- Strictly preserve Phase 1 permanent lead deletion and its explicit irreversible confirmation (`api.leads.delete(id)`), CSV duplicate accounting, preview behavior, skipped/invalid row calculations, and existing import/discovery API contracts.
- Do not change backend, data model, or lead business rules.

### R3. CRM Pipeline & Operations Workspace Redesign
- Redesign the CRM pipeline (`app/(dashboard)/crm/**`, `components/crm/**`) as a polished sales workspace, improving stage headers, deal cards, pipeline filters, search, stage counts, and action controls.
- Improve Operations and follow-up workspaces (`app/(dashboard)/operations/**`, `components/operations/**`), tabs, task lists, due-state indicators, and empty/loading/error states, maintaining readability under high data volume.
- Preserve existing stage definitions, lead-to-deal relationships, task/follow-up behavior, API calls, permissions, filters, and state transitions without inventing new CRM behavior.

### R4. Outreach, Analytics & Settings Workspace Redesign
- Redesign Outreach (`app/(dashboard)/outreach/**`, `components/outreach/**`) into a clear campaign and communication workspace, improving composer fields, queue tabs, campaign summaries, and action hierarchy.
- Redesign Analytics (`app/(dashboard)/analytics/**`, `components/analytics/**`) with readable KPI cards, chart hierarchy, filters, date ranges, and export controls.
- Redesign Settings (`app/(dashboard)/settings/**`, `components/settings/**`) with consistent sections, labels, switches, forms, security controls, and destructive-action confirmations.
- Preserve email approval and safety controls, disabled-by-default dispatch safeguards, outreach/campaign APIs, analytics calculations/exports, settings persistence, permissions, and suppression rules.
- Do not enable live email sending, change credentials, or modify backend behavior.

### R5. Design-System Integration, Cross-Feature Consistency & Quality Assurance
- Apply a refined monochrome design language throughout the application reusing Phase 2A tokens (`--surface-canvas`, `--surface-panel`, `--surface-card`, `--surface-card-hover`, `--surface-elevated`), neutral carbon/platinum palette, restrained semantic status accents (no rainbow accents or decorative glow), consistent typography (avoiding excessive 9-10px text, using tabular figures for metrics), and consistent button, input, card, modal, and badge styling.
- Coordinate independent parallel workstreams across five subagents without simultaneous edits to shared files, centralizing changes to shared primitives in `components/ui/**` and global styles in `app/globals.css` without breaking public component APIs.
- Inspect the integrated diff across all feature areas for visual consistency, interaction quality, and accessibility.

### R6. System Invariants & Strictly Protected Calling Modules
- Do not edit, rename, reformat, or delete protected calling files: `app/(dashboard)/calling/**`, `components/calling/**`, `types/calling.ts`, calling APIs in `lib/api-client.ts`, and backend voice modules.
- Do not alter backend routers, services, integrations, Prisma schema, or migrations.
- Git rules: stay on `closebds-premium-monochrome-redesign`; do not commit, push, merge, stage files, or switch branches.
- Do not run production migrations, promote deployments, change production environment variables, or deploy to production without explicit user approval.
- Produce a consolidated final walkthrough report covering the 13 required sections upon completion and stop for user review.

## Acceptance Criteria

### Visual Redesign & Design System
- [ ] Landing page, auth screens, Leads, CRM, Operations, Outreach, Analytics, and Settings display substantive visual improvements in layout, hierarchy, spacing, and styling using the Phase 2A/2B monochrome foundation.
- [ ] No decorative rainbow accents or excessive glow; semantic colors are restrained to status indicators.
- [ ] Responsive desktop-first layouts maintain clear alignment without cramped density or excessive header stacking.

### Functional Invariants & Protected Scope
- [ ] Protected calling paths (`app/(dashboard)/calling/**`, `components/calling/**`, `types/calling.ts`, `lib/api-client.ts` calling endpoints) and backend repository remain completely untouched.
- [ ] Phase 1 permanent lead deletion and CSV import duplicate calculations remain strictly preserved.
- [ ] Email dispatch safeguards remain disabled by default with approval controls intact.
- [ ] Backend schemas, routes, and APIs remain unchanged.

### Verification & Quality Gates
- [ ] `npm run typecheck` passes with zero type errors.
- [ ] `npm run lint` passes or existing lint errors are documented.
- [ ] `npm run build` completes successfully.
- [ ] `git diff --check` shows no whitespace or merge conflict markers.
- [ ] Available browser smoke tests are executed and outcomes reported.
- [ ] A consolidated final walkthrough report is produced covering all 13 required sections.
- [ ] No git commit, push, merge, or deployment is executed.
