## 2026-10-29T19:23:00Z

You are Worker 5: Design-System Integration & Quality Assurance Lead for the CloseVDS Master UI Redesign.
Your assigned working directory: c:\Users\Admin\Desktop\CloseBDS OS\CloseBDS Frontend\.agents\teamwork\worker_r5_design_qa
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
- `components/ui/**` (shared primitives: button, card, input, badge, dialog, tabs, toast, empty-state, icons, etc.)
- `app/globals.css` (surface tokens, precision border variables, typography scale, tabular figure utility classes)
- Testing/verification scripts in `scratch/**` or root config if needed

REQUIREMENTS (R5):
1. Design System Foundation & Cross-Feature Token Consistency:
   - Ensure the Obsidian precision monochrome design system is rock solid.
   - Tokens: `--surface-canvas`, `--surface-panel`, `--surface-card`, `--surface-card-hover`, `--surface-elevated`, neutral carbon/platinum palette (`#09090b`, `#121218`, `#27272a`, `#a1a1aa`, `#ffffff`), 1px precision borders, restrained semantic status accents (no rainbow or glowing decorative colors), tabular numbers.
   - Refine shared primitives in `components/ui/**` (buttons, badges, inputs, dialogs, cards, tabs, dropdowns, empty states) to ensure premium ergonomics, crisp micro-interactions, accessibility (focus rings, ARIA), and consistent visual weight without breaking existing public component APIs/props.
2. Full Integration & Quality Assurance Verification:
   - Run the full suite of verifications and capture exact terminal outputs:
     a) `npm run typecheck` (must pass with 0 errors)
     b) `npm run lint` (document any existing warnings/errors)
     c) `npm run build` (must compile successfully)
     d) `git diff --check` (verify no whitespace or merge conflict markers)
     e) Execute available smoke tests: `npx tsx scratch/test-phase4-calling.ts`, `npx tsx scratch/test-phase5-sales-ops.ts`, `npx tsx scratch/test-phase6-e2e.ts` (or run them using tsx/node)
     f) Verify strictly protected calling files: `git status --porcelain` and `git diff --stat app/(dashboard)/calling components/calling types/calling.ts lib/api-client.ts` to prove zero lines were touched in protected files.
   - Note: If other workers are still actively editing files when you start, first inspect and refine `components/ui/**` and `app/globals.css`. Once all components are ready, run the full test suite and verify the integrated codebase.

EXECUTION & VERIFICATION:
- Maintain `progress.md` in your working directory with timestamps.
- When complete, write a comprehensive `handoff.md` in your working directory with:
  1. Design system audit and shared component improvements
  2. Full test outputs (`typecheck`, `lint`, `build`, `git diff --check`, smoke tests)
  3. Strict invariant attestation (calling paths 100% untouched, git branch preserved)
  4. Conclusion
- Send a message to orchestrator (`6d8d0675-f4c2-4238-92e3-74479dfe1c45`) announcing your completion and report path.
