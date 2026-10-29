## 2026-10-29T19:22:23Z
You are Worker 1: Auth & Landing Specialist for the CloseVDS Master UI Redesign.
Your assigned working directory: c:\Users\Admin\Desktop\CloseBDS OS\CloseBDS Frontend\.agents\teamwork\worker_r1_auth_landing
Orchestrator conversation ID: 6d8d0675-f4c2-4238-92e3-74479dfe1c45

MANDATORY FIRST STEP:
Read c:\Users\Admin\Desktop\CloseBDS OS\CloseBDS Frontend\.agents\teamwork\ORIGINAL_REQUEST.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY PROTECTED CONSTRAINTS:
- NEVER touch, edit, format, or rename files in:
  - app/(dashboard)/calling/**
  - components/calling/**
  - types/calling.ts
  - lib/api-client.ts calling APIs
  - Any backend routes, Prisma schema, services, or migrations
- Git rules: Stay on branch `closebds-premium-monochrome-redesign`. DO NOT run git commit, git push, git merge, or stage files.

YOUR EXCLUSIVE SCOPE:
Files you own and edit:
- `app/page.tsx` and any landing components in `components/landing/**` or sub-components of landing
- `app/(auth)/**` (login, register, forgot-password, reset-password)
- `components/auth/**`

REQUIREMENTS (R1):
1. Landing Page Redesign:
   - Visibly redesign the public landing page (`app/page.tsx` and landing components) with a stronger hero section, clear product positioning (CloseVDS: AI Client Acquisition OS), polished CTA hierarchy (Sign In / Access Workspace / Book Demo), feature sections showcasing autonomous pipeline & outreach, trust-oriented enterprise presentation, and professional footer.
   - Desktop-first, clean visual rhythm, Obsidian monochrome palette (`--surface-canvas`, `--surface-panel`, `--surface-card`, `--border-subtle`, 1px borders, subtle hover effects).
   - DO NOT invent fake testimonials, logos, user counts, or fake metrics.
2. Auth Experience Redesign:
   - Redesign Login, Register, Forgot Password, and Reset Password screens (`app/(auth)/**`, `components/auth/**`).
   - Standardize form layout, input spacing, clear validation feedback, card proportions, visual hierarchy, polished monochrome inputs/buttons.
   - STRICTLY PRESERVE existing authentication providers, API integrations, form validation, session handling, redirects, and password-reset behavior.

EXECUTION & VERIFICATION:
- Maintain `progress.md` in your working directory with timestamps.
- Run `npm run typecheck` to verify your changes compile with zero TypeScript errors.
- When complete, write a comprehensive `handoff.md` in your working directory with:
  1. Observation (what existed before)
  2. Logic Chain & Changes Made (exact files modified and design improvements)
  3. Verification Method & Output (`npm run typecheck` output)
  4. Invariant Attestation (confirming auth logic preserved and protected paths untouched)
  5. Conclusion
- Send a message to orchestrator (`6d8d0675-f4c2-4238-92e3-74479dfe1c45`) announcing your completion.
