# CloseVDS V2 Frontend Redesign Plan

## Objective

Redesign the existing CloseVDS frontend into a clear, premium client-acquisition workspace while preserving the current Next.js/React/TypeScript/Tailwind stack, existing backend contracts, authentication, and working functionality.

## Product rules

- CloseVDS does not discover or scrape leads with AI. Users provide lead lists by CSV/XLSX upload or manual entry.
- AI can process user-provided lead data: normalize fields, identify likely duplicates, summarize, score, and help draft outreach.
- Never show fake metrics, demo records, or a provider as connected unless that state is verified.
- Keep provider integrations behind the backend. Never expose API keys or SIP credentials in the browser.
- Keep outbound communication permission-aware: support opt-in/consent records, suppression lists, and explicit user review where required.
- Avoid a backend rewrite. Audit existing APIs before adding or changing contracts.

## Initial code audit

The repository already contains Next.js App Router pages/components for Dashboard, Leads, CRM, AI Calling, Analytics, Outreach, Operations, and Settings. AI Calling already has agent, call queue/history, and telephony settings routes. Leads currently imports a Lead Discovery modal, and the dashboard has a lead-discovery card. The main navigation does not yet expose Outreach as a primary item, and there is no dedicated Email Workspace route in the current route tree.

## Proposed primary navigation

1. Overview
2. Leads
3. Sales Pipeline
4. AI Calling
5. Outreach
6. Email Workspace
7. Tasks & Follow-ups
8. Analytics
9. Integrations & Usage
10. Settings & Security

Keep routes that already serve a purpose and map/rename them carefully; do not remove functionality without confirming where it is used.

## Page responsibilities

- **Overview:** Real recorded metrics, recent activity, tasks due, and setup/connection health. No lead discovery widget.
- **Leads:** Search/filter/sort, full lead records, status, source, score, next follow-up, activity history, bulk actions, and lead details.
- **Import Center:** CSV/XLSX upload, column mapping, preview, validation errors, duplicate review, import summary, and manual lead entry.
- **Sales Pipeline:** Existing CRM stages and deal/activity data, with clear next actions.
- **AI Calling:** Agent setup, provider/SIP configuration status, campaign/queue controls, call outcomes, transcripts/recordings where available, and usage/cost visibility.
- **Outreach:** WhatsApp/SMS/phone workflow where supported by connected providers, templates, send queue, delivery/reply status, consent and suppression checks.
- **Email Workspace:** AI-assisted draft composer, provider connection status, recipient preview, send confirmation, sent history, and delivery/reply tracking only where APIs support it.
- **Tasks & Follow-ups:** Follow-up dates, overdue items, reminders, and lead-linked activity.
- **Analytics:** Metrics derived from real backend events with honest empty/error states.
- **Integrations & Usage:** Provider configuration, connection tests, usage and error visibility, without displaying secrets.

## Implementation sequence

1. Audit current routes, shared shell, navigation, API client, and page-level loading/error/empty states.
2. Lock navigation and shared layout; remove lead-discovery entry points and replace them with user-provided lead import.
3. Redesign Overview and Leads/Import Center.
4. Polish the existing AI Calling area without rebuilding its backend prematurely.
5. Add/complete Outreach and Email Workspace UI against verified existing API contracts.
6. Add Tasks/Follow-ups and analytics improvements only where the existing backend supports them.
7. Run lint, TypeScript checks, production build, and route/API smoke tests.

## Design direction

Use the existing monochrome black/white foundation. Improve hierarchy, spacing, typography, contrast, table readability, page headers, action grouping, responsive behavior, and loading/empty/error states. Keep motion restrained and avoid gradients/glows as a substitute for clear information design. Do not introduce a new UI framework or over-engineer shared abstractions.
