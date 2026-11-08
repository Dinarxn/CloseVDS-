# Project: CloseVDS AI Calling Subsystem End-to-End Platform

## Architecture & System Overview
CloseVDS AI Calling Subsystem is a multi-provider, sovereign, secure, observable voice automation platform operating across:
- **Frontend**: Next.js App Router (`CloseBDS Frontend`, branch `closebds-premium-monochrome-redesign`)
- **Backend**: Node.js/Express/TypeScript + Prisma (`CloseBDS Backend/backend`)

The subsystem integrates:
1. **Telephony Layer**: Twilio for carrier connectivity, phone number management (fetch, import, capability check, agent assignment without purchasing), SIP trunking/routing, call status webhooks.
2. **Voice AI Layer**: Multi-provider voice intelligence supporting Retell AI and Vapi via independent adapters with separate credentials, voice/model discovery, assistant/agent synchronization, and call initiation.
3. **Voice Agent Studio**: 11-step configuration wizard (Provider, Model, Voice, System Prompts, Knowledge Base/Talking Points, Objection Handling, Qualification Questions, Number Assignment, Safety & Guardrails, Test Configuration, Review & Readiness Validation) with strict lifecycle states: `Draft` → `Incomplete` → `Ready for Test` → `Tested` → `Active` → `Paused/Error`.
4. **Operations & Safety Engine**: Call preparation, pre-flight validation, idempotency/duplicate prevention, queue management, human approval gate, DNC/suppression list enforcement, calling windows, daily volume limits, retry cooldowns, and emergency kill switch.
5. **Observability & Analytics**: Call detail view with real audio timeline, authorized recording playback, synchronized transcript viewer, latency tracking, sentiment analysis, and telemetry KPI cards.
6. **Integration Layer**: n8n integration with scoped API keys, one-time reveal, revocation, and signature-verified webhook delivery logs.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Shared Contracts & Types | TypeScript interfaces for TelephonyProvider, VoiceAIProvider, ProviderCapabilities, NormalizedCallStatus | M1 (R1) | R1 |
| 2 | Architecture Audit & Multi-Provider Core | Audit frontend/backend branches, establish independent adapter patterns, base provider registries | M1 (R1) | R1 |
| 3 | Twilio Telephony Adapter | Connection management, server-side encrypted credentials, account status, status normalization | M2 (R2) | R2 |
| 4 | Phone Number Management | Fetch, import, capability validation (Voice, SMS), inbound/outbound config, agent assignment | M2 (R2) | R2 |
| 5 | Twilio Webhook Handler | Signature verification, replay protection, call status synchronization | M2 (R2) | R2 |
| 6 | Retell AI Adapter | Connection testing, voice/model discovery, assistant sync, call dispatch | M3 (R3) | R3 |
| 7 | Vapi Adapter | Connection testing, voice/model discovery, assistant sync, call dispatch | M3 (R3) | R3 |
| 8 | Voice AI Webhooks & Transcripts | Signature-verified webhook ingress, status normalization, transcript & recording metadata sync | M3 (R3) | R3 |
| 9 | 11-Step Voice Agent Studio | Guided wizard configuring provider, voice, model, prompt, knowledge, objections, questions, numbers | M4 (R4) | R4 |
| 10 | Voice Agent Lifecycle State Machine | Strict transitions (Draft → Incomplete → Ready for Test → Tested → Active → Paused/Error) with backend readiness gate | M4 (R4) | R4 |
| 11 | Provider-Agent-Number Compatibility | Pre-flight validation ensuring agent provider matches assigned phone number capability | M4 (R4) | R4 |
| 12 | Call Preparation & Pre-Flight Engine | Pre-call checklist validating lead phone, active agent, provider status, calling window, DNC, daily limits, kill switch | M5 (R5) | R5 |
| 13 | Call Queue & Idempotent Dispatch | Queue management with deduplication, idempotency tokens, lock management | M5 (R5) | R5 |
| 14 | Safety Invariants Engine | Human approval gate, DNC suppression list, calling hours, daily limits, retry cooldown, emergency kill switch | M5 (R5) | R5 |
| 15 | Call Timeline, Transcript & Detail View | Timeline visualization, synchronized transcripts, authorized recording playback metadata | M5 (R5) | R5 |
| 16 | Calling Overview & Real Telemetry | Obsidian KPI cards, real-time metrics, active call counts, daily volume gauges | M6 (R6) | R6 |
| 17 | Provider Integration Center | Provider cards (Twilio, Retell, Vapi) displaying verified/unverified connection status, credentials modal | M6 (R6) | R6 |
| 18 | n8n Integration Hub | Scoped API key management, one-time reveal, revocation, delivery logs | M6 (R6) | R6 |
| 19 | Obsidian Precision Design (#000000, #7D39EB, #C6FF33, #FFFFFF) | Desktop-first monochrome styling with purple (#7D39EB) and electric lime (#C6FF33) accents | M6 (R6) | R6 |
| 20 | Cross-System QA & Verification Suite | Frontend typecheck, lint, build, git diff check; Backend tests, typecheck, lint, build | M6 (R6) | AC |
| 21 | 21-Section Walkthrough Report | Comprehensive final report covering all required dimensions | M6 (R6) | AC |

## Milestones & Subagent Allocation (Exactly 6 Subagents)
| # | Name | Assigned Agent | Scope | Dependencies | Status |
|---|------|----------------|-------|-------------|--------|
| M1 | Architecture Audit & Shared Contracts | `worker_calling_r1_arch_contracts` | Frontend/Backend audit, branch verification, shared TypeScript interfaces, credential security model, multi-provider base contracts | None | PLANNED |
| M2 | Telephony & Phone Numbers (Twilio) | `worker_calling_r2_telephony_twilio` | Twilio adapter, number management (no auto-purchase), capability validation, signature webhooks, encrypted credential handling | M1 | PLANNED |
| M3 | Voice AI Providers (Retell & Vapi) | `worker_calling_r3_voice_providers` | Independent Retell AI and Vapi adapters, voice/model discovery, assistant sync, signature webhooks, transcript & recording sync | M1 | PLANNED |
| M4 | Voice Agent Studio & Lifecycle | `worker_calling_r4_agent_studio` | 11-step configuration wizard, strict lifecycle state machine, backend readiness check, provider-agent-number compatibility validator | M1, M2, M3 | PLANNED |
| M5 | Calling Operations & Safety Invariants | `worker_calling_r5_ops_safety` | Call preparation, pre-flight gate, human approval gate, DNC suppression, calling windows, daily limits, emergency kill switch, call queue, timeline & transcript viewers | M1, M2, M3 | PLANNED |
| M6 | Frontend Experience, n8n & Final QA | `worker_calling_r6_frontend_n8n_qa` | Calling Overview, Provider Integration Center, n8n key manager & delivery logs, Obsidian styling (#000000, #7D39EB, #C6FF33, #FFFFFF), full test suites (typecheck, lint, build, diff checks), and 21-section final report | M1, M2, M3, M4, M5 | PLANNED |

## Code Layout & File Boundaries
- **Subagent 1 (R1)**:
  - `CloseBDS Frontend/types/calling.ts`
  - `CloseBDS Frontend/types/voice-agent.ts`
  - `CloseBDS Backend/backend/src/modules/voice/voice.types.ts`
  - `CloseBDS Backend/backend/src/integrations/calling/calling.adapter.ts`
  - `CloseBDS Backend/backend/src/integrations/voice-ai/voice-ai.adapter.ts`
- **Subagent 2 (R2)**:
  - `CloseBDS Backend/backend/src/integrations/calling/twilio.adapter.ts`
  - `CloseBDS Backend/backend/src/integrations/calling/index.ts`
  - `CloseBDS Backend/backend/src/modules/voice/telephony.service.ts`
  - `CloseBDS Backend/backend/src/modules/voice/phone-numbers.service.ts`
  - `CloseBDS Frontend/components/calling/telephony-management-card.tsx`
  - `CloseBDS Frontend/components/calling/phone-numbers-table.tsx`
- **Subagent 3 (R3)**:
  - `CloseBDS Backend/backend/src/integrations/voice-ai/retell.adapter.ts`
  - `CloseBDS Backend/backend/src/integrations/voice-ai/vapi.adapter.ts`
  - `CloseBDS Backend/backend/src/integrations/voice-ai/index.ts`
  - `CloseBDS Backend/backend/src/modules/voice/voice-ai.service.ts`
  - `CloseBDS Backend/backend/src/modules/voice/voice-webhook.service.ts`
- **Subagent 4 (R4)**:
  - `CloseBDS Frontend/components/calling/voice-agent-studio/**`
  - `CloseBDS Frontend/components/calling/voice-agent-form.tsx`
  - `CloseBDS Frontend/components/calling/voice-agent-card.tsx`
  - `CloseBDS Frontend/app/(dashboard)/calling/agents/**`
  - `CloseBDS Backend/backend/src/modules/voice/voice.lifecycle.ts`
  - `CloseBDS Backend/backend/src/modules/voice/voice-agent-readiness.service.ts`
- **Subagent 5 (R5)**:
  - `CloseBDS Backend/backend/src/modules/voice/voice.safety.ts`
  - `CloseBDS Backend/backend/src/modules/voice/calling-policy.service.ts`
  - `CloseBDS Backend/backend/src/modules/voice/voice.service.ts`
  - `CloseBDS Backend/backend/src/modules/voice/voice.router.ts`
  - `CloseBDS Frontend/components/calling/call-preparation-modal.tsx`
  - `CloseBDS Frontend/components/calling/call-dispatch-modal.tsx`
  - `CloseBDS Frontend/components/calling/call-safety-modal.tsx`
  - `CloseBDS Frontend/components/calling/call-timeline.tsx`
  - `CloseBDS Frontend/components/calling/call-transcript-viewer.tsx`
  - `CloseBDS Frontend/components/calling/calls-table.tsx`
  - `CloseBDS Frontend/app/(dashboard)/calling/calls/**`
- **Subagent 6 (R6)**:
  - `CloseBDS Frontend/app/(dashboard)/calling/page.tsx`
  - `CloseBDS Frontend/app/(dashboard)/calling/settings/page.tsx`
  - `CloseBDS Frontend/components/calling/provider-status-card.tsx`
  - `CloseBDS Frontend/components/calling/provider-integration-center.tsx`
  - `CloseBDS Frontend/components/calling/calling-kpi-grid.tsx`
  - `CloseBDS Frontend/components/calling/n8n-keys-manager.tsx`
  - `CloseBDS Frontend/components/calling/n8n-deliveries-table.tsx`
  - Verification & 21-section report compilation across entire workspace
