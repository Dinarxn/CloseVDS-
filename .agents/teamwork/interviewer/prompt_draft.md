Use exactly SIX specialized subagents, plus yourself as the principal orchestrator. Execute the complete end-to-end implementation of the AI Calling subsystem for CloseVDS across frontend (`CloseBDS Frontend`, branch `closebds-premium-monochrome-redesign`) and backend (`CloseBDS Backend`) in one coordinated project run, transforming the incomplete AI Calling experience into a fully configurable, integrated, secure, observable, multi-provider (Twilio, Retell AI, Vapi) calling platform.

Integrity mode: development

## Verification Resources
- Use mock adapters, local test fixtures, and existing test suites in both repositories (`npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`).
- Mark live provider status as unverified in the UI and reports unless verified credentials exist in local environment files.

## Requirements

### R1. Architecture Audit, Shared Integration Contracts & Multi-Provider Architecture
Audit frontend and backend codebases, verify active branches (`closebds-premium-monochrome-redesign` on frontend, inspect and verify backend), and define shared integration contracts and TypeScript interfaces for TelephonyProvider, VoiceAIProvider, ProviderCapabilities, NormalizedCallStatus, and secure credential handling. Ensure Twilio, Retell AI, and Vapi operate through independent adapters and configurations without cross-provider coupling, preserving workspace boundaries and preventing duplicate calls.

### R2. Telephony & Phone Number Management (Twilio)
Implement telephony connection management, server-side encrypted credential storage, account status, and phone number management without automatic purchasing. Support number capability validation, inbound/outbound configuration, agent assignment, signature-verified webhooks, and call status synchronization, returning only masked credentials to the client.

### R3. Voice AI Provider Integrations (Retell AI & Vapi)
Implement independent API adapters for Retell AI and Vapi supporting authentication, connection testing, voice and model discovery, assistant/agent synchronization, and call initiation through existing backend orchestration. Integrate provider-specific webhooks with signature verification, status normalization, transcript retrieval, and recording metadata synchronization.

### R4. Voice Agent Studio & Lifecycle Management
Build a guided 11-step voice agent configuration studio supporting provider selection (Retell or Vapi), provider-specific model/voice selection, system prompts, knowledge/talking points, objection handling, qualification questions, phone number assignment, and safety configurations. Enforce strict lifecycle transitions (Draft → Incomplete → Ready for Test → Tested → Active → Paused/Error) requiring verified backend readiness before activation.

### R5. Calling Operations, Observability & Safety Invariants
Implement the complete call preparation, dispatch, queue, history, and detail views reusing existing backend call dispatch with strict idempotency and duplicate prevention. Preserve all non-negotiable safety invariants: human approval gate, DNC/suppression list enforcement, calling windows, daily limits, retry cooldowns, and emergency kill switch.

### R6. Frontend Experience, Operational Overview & n8n Integration
Build a desktop-first frontend using the CloseVDS obsidian design system (#000000, #7D39EB, #C6FF33, #FFFFFF) featuring the Calling Overview with real backend telemetry, Provider Integration Center, Telephony/Number management, Agent Studio, and Call Queue/Detail views. Maintain and improve the n8n integration with scoped API keys, one-time reveal, key revocation, and delivery logging without bypassing safety gates.

## Acceptance Criteria

### Multi-Provider Architecture & Phone Numbers
- [ ] Twilio, Retell AI, and Vapi integrations operate through independent adapters with separate credentials, validation, and webhook verification.
- [ ] Credentials are encrypted server-side and returned only as masked representations to the frontend.
- [ ] Phone numbers can be retrieved, imported, capability-validated, and assigned without automatic purchasing.
- [ ] Provider connection cards display accurate connection states (Not Configured, Connecting, Connected, Connection Failed, Degraded, Disconnected) without fabricated live telemetry.

### Voice Agent Studio & Lifecycle
- [ ] 11-step agent creation wizard configures provider-specific models, voices, prompts, knowledge points, and objection handling.
- [ ] Agent activation requires confirmed backend readiness checks and cannot be activated merely via UI button click.
- [ ] Provider-agent-number compatibility is strictly validated before test or activation.

### Call Lifecycle, Operations & Safety
- [ ] Call preparation validates lead phone number, active agent, provider status, calling window, DNC suppression, daily limits, and kill switch before requiring human approval.
- [ ] Call dispatch reuses existing backend orchestration with idempotency and duplicate call prevention.
- [ ] Call queue and detail views display actual timelines, normalized statuses, transcripts, and authorized recordings fetched from real backend data.
- [ ] All safety invariants (human approval gate, DNC list, daily limits, retry cooldown, emergency kill switch) remain strictly intact.

### Webhooks & n8n Integration
- [ ] Webhook endpoints for Twilio, Retell, and Vapi enforce signature verification, replay protection, and idempotent event processing.
- [ ] n8n integration supports scoped API keys, one-time secret reveal, revocation, and webhook delivery logging without bypassing approval or safety checks.

### Quality, Git & Reporting
- [ ] Frontend checks (`npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`) pass without error.
- [ ] Backend checks (existing tests, typecheck, lint, build) pass without error.
- [ ] Active git branches are verified (`closebds-premium-monochrome-redesign` on frontend); no destructive git actions, branch switches, commits, pushes, merges, or deployments are executed.
- [ ] A comprehensive final report covering all 21 required sections is delivered upon completion.
