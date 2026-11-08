<div align="center">

# CloseVDS

**AI Client Acquisition OS — Find. Qualify. Reach. Close.**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Fastify](https://img.shields.io/badge/Fastify-5.2.1-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1.4.14-7D39EB?style=for-the-badge&logoColor=white)](https://langchain-ai.github.io/langgraphjs/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4.1-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-C6FF33?style=for-the-badge&labelColor=000000&color=C6FF33)](https://github.com/Dinarxn/CloseVDS-)

<p align="center">
  An autonomous, enterprise-grade AI Client Acquisition Operating System engineered for high-intent B2B lead discovery, composite website gap audits, multi-channel permission-gated outreach, and multi-provider voice calling.
</p>

[Key Features](#-key-features) •
[Brand & Design System](#-brand--design-system) •
[Architecture](#-system-architecture) •
[AI Calling Subsystem](#-ai-voice-calling-subsystem) •
[Outreach Pipeline](#-permission-gated-outreach-pipeline) •
[Quickstart](#-quickstart--local-development) •
[Directory Structure](#-repository-structure)

</div>

---

## ✦ Overview

**CloseVDS** replaces fragmented sales stacks with a unified, autonomous Client Acquisition Operating System. It bridges the gap between cold prospect discovery and closed revenue through grounded intelligence, multi-provider voice agents, and strict operator safety controls:

1. **Find & Audit**: Discover prospects and automatically run multi-point digital gap audits (performance, mobile optimization, conversion pixels, tech stack analysis).
2. **Qualify**: Dynamically calculate composite lead scores (Relevance Score + Opportunity Score = Total Qualification Score) using grounded LLM intelligence.
3. **Reach**: Execute orchestrated multi-channel outreach across **Email**, **WhatsApp**, and **AI Phone Calls** with enforced human-in-the-loop approval gates.
4. **Close**: Conduct autonomous voice discovery calls powered by **Twilio + Retell AI + Vapi**, track conversion telemetry across a 9-stage CRM pipeline, and sync actions directly into daily operations queues.

---

## 🎨 Brand & Design System

CloseVDS is built on a high-contrast, distraction-free **Obsidian Monochrome & Chromatic Precision** design language.

### Approved Core Palette

| Token | Hex | Role & Application |
| :--- | :--- | :--- |
| **Black** | `#000000` | Canvas background, dark structural surfaces, sidebars |
| **Violet** | `#7D39EB` | Primary interactive actions, selected states, active indicators |
| **Lime** | `#C6FF33` | Live system states, healthy nodes, positive KPIs, success indicators |
| **White** | `#FFFFFF` | Primary typography, crisp headings, high-contrast badges |

### Obsidian Precision Surfaces

```
Canvas (#000000) ──> Panel (#0A0A0E) ──> Card (#111116) ──> Hover/Input (#171720) ──> Elevated (#1D1D28)
```

- **Canvas (`#000000`)**: Deep-black base viewport background.
- **Panel (`#0A0A0E`)**: Structural container surface for sidebar navigation and header bars.
- **Card (`#111116`)**: Primary content and data table surfaces.
- **Input & Hover (`#171720`)**: Interactive fields, dropdown menus, and card hover states.
- **Elevated (`#1D1D28`)**: Floating modals, flyouts, and command palette overlays.
- **Specular Hairline Borders**: `rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.14)` for micro-contrast depth.

---

## 🏛 System Architecture

CloseVDS pairs a high-performance **Next.js 15 App Router** frontend with an event-driven **Fastify 5 REST API** backend, connected via shared TypeScript contracts and strict Zod validation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CloseVDS Web Application                        │
│                 Next.js 15 (React 19) + Tailwind CSS v4                │
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────┐ │
│  │ Lead Intelligence│  │ Outreach Center  │  │ Voice Agent Studio    │ │
│  │ & Audit Engine   │  │ (4-Gate Protocol)│  │ (11-Step Configurator)│ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────────┬───────────┘ │
│           │                     │                        │             │
│  ┌────────┴─────────┐  ┌────────┴─────────┐  ┌───────────┴───────────┐ │
│  │ Sales Pipeline   │  │ Operations Queue │  │ Observability         │ │
│  │ (9-Stage Kanban) │  │ & Daily Tasks    │  │ (Calls & Waveforms)   │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────────┬───────────┘ │
│           └─────────────────────┼────────────────────────┘             │
│                                 ▼                                      │
│                  Type-Safe API Client (`lib/api-client.ts`)            │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ HTTPS / REST (JSON)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CloseVDS Backend Engine                         │
│                    Fastify 5 + LangGraph + Prisma                      │
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────┐ │
│  │ Safety Shield    │  │ Qualification &  │  │ n8n Automation        │ │
│  │ (10 Dispatch     │  │ Personalization  │  │ Gateway               │ │
│  │  Pre-Flight Gates│  │ (LangGraph Node) │  │ (HMAC-SHA256 Webhooks)│ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────────┬───────────┘ │
│           └─────────────────────┼────────────────────────┘             │
│                                 ▼                                      │
│                Multi-Provider Telephony & Voice Matrix                 │
│                                                                        │
│         ┌───────────────────────┼───────────────────────┐              │
│         ▼                       ▼                       ▼              │
│    ┌─────────┐            ┌───────────┐           ┌───────────┐        │
│    │ Twilio  │            │ Retell AI │           │   Vapi    │        │
│    │ Carrier │            │ Voice AI  │           │ Voice AI  │        │
│    │ PSTN/SIP│            │  Runtime  │           │  Runtime  │        │
│    └─────────┘            └───────────┘           └───────────┘        │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
                         PostgreSQL Database
```

---

## ⚡ Key Features

### 🎙 Multi-Provider AI Voice Calling Subsystem

CloseVDS features a decoupled, multi-provider voice architecture designed for high availability and zero vendor lock-in:

- **Telephony Carrier**: **Twilio** handles carrier-grade PSTN calling, SIP trunking, number registration, and call control.
- **Voice AI Engines**: Independent integrations for both **Retell AI** and **Vapi**. Agents bind to their selected provider without cross-polluting configuration or call records.
- **BYO Carrier Phone Numbers**: Bring-Your-Own phone number management with live E.164 verification and strict anti-abuse safeguards (`purchasedWithoutAutoBuy: true`).
- **11-Step Voice Agent Studio Wizard**:
  1. *Provider Select*: Toggle Retell AI vs. Vapi with verified capability matrix.
  2. *Model Select*: Choose LLM backends (GPT-4o, Claude 3.5 Sonnet, Gemini Flash), temperature, and max token budget.
  3. *Voice Selection*: Select expressive natural voices with dynamic pitch, speed, and live sample preview.
  4. *Persona & Prompting*: Define core identity, system prompts, role constraints, and conversation objectives.
  5. *Knowledge Base*: Mount domain documents, company FAQs, and product collateral.
  6. *Qualification Script*: Define BANT/MEDDPIC discovery flows and mandatory prospect questions.
  7. *Objection Handling*: Add scenario playbooks for pricing, timing, authority, and competitor objections.
  8. *Safety Guardrails*: Configure topic exclusions, compliance statements, and disclaimers.
  9. *Phone Number Association*: Bind validated E.164 caller IDs.
  10. *Test Sandbox Configuration*: Configure mock test variables and simulation parameters.
  11. *Readiness Review & Validation*: Comprehensive pre-flight deployment checklist.
- **Server-Authoritative Agent Lifecycle**: Strict state machine enforcement:
  `DRAFT` ➔ `INCOMPLETE` ➔ `READY_FOR_TEST` ➔ `TESTED` ➔ `ACTIVE` ➔ `PAUSED` / `ERROR`.
- **Live Observability & Call Intelligence**:
  - 8-stage call lifecycle: `QUEUED` ➔ `PREPARING` ➔ `DISPATCHED` ➔ `RINGING` ➔ `CONNECTED` ➔ `COMPLETED` / `FAILED` / `REJECTED`.
  - Real-time dual-speaker transcript viewer with sentiment highlights and utterance turnaround latency.
  - Interactive HTML5 call audio player with waveform scrub navigation and variable playback speed.

---

### 🛡 The 4-Gate Permission Outreach Pipeline

Every outreach action is governed by the CloseVDS Safety Pipeline to prevent hallucinated, unauthorized, or out-of-bounds client contact:

```
[ Gate 1: AI Research & Draft ]
              │  Anti-hallucination grounded context enforced
              ▼
[ Gate 2: Operator Review & Approval ]
              │  Mandatory human-in-the-loop review before dispatch
              ▼
[ Gate 3: Controlled Dispatch Queue ]
              │  Rate-limited, provider-verified transmission
              ▼
[ Gate 4: Follow-up & Cadence Scheduling ]
                 Cadence stops immediately upon prospect response
```

- **Multi-Channel Composer**: Author personalized **Email**, **WhatsApp**, and **Voice** touches with dynamic variable interpolation (`{{lead.name}}`, `{{lead.company}}`, `{{lead.website}}`, `{{audit.missingPixel}}`).
- **Outreach Activity Timeline**: Unified chronological trail linking every sent email, received reply, and recorded phone call directly to the prospect's CRM profile.

---

### 🔍 Lead Discovery, Gap Audit & Composite Scoring

- **Multi-Source Ingestion**: Ingest CSV lead lists or discover prospects through location-based Geoapify search with automatic schema normalization.
- **Autonomous Digital Gap Audit**: Discovers actionable technical deficiencies:
  - Missing meta tags, OpenGraph data, or viewport configurations.
  - Absence of Facebook Pixel, Google Tag Manager, or TikTok tracking scripts.
  - Slow Server Response Time (TTFB) and broken layout cues.
- **Composite Scoring Formula**:
  $$\text{Total Score} = \text{Relevance Score} + \text{Opportunity Score}$$
  Leads are instantly ranked into High, Medium, or Low acquisition priority buckets.

---

### 📊 Sales Pipeline CRM & Operations Command Center

- **9 Canonical Pipeline Stages**:
  `DISCOVERED` ➔ `QUALIFIED` ➔ `OUTREACH_READY` ➔ `CONTACTED` ➔ `INTERESTED` ➔ `MEETING_SCHEDULED` ➔ `NEGOTIATION` ➔ `WON` ➔ `LOST`.
- **Kanban Board & Stage Management**: Drag-and-drop pipeline visualization with instant deal value calculations and stage win probability tracking.
- **Operations Workspace**:
  - **Active Call Queue**: Real-time list of leads waiting for live dialer dispatch.
  - **Call-Ready Prospects**: Pre-screened candidates meeting all 10 pre-flight safety gates.
  - **Task & Follow-up Scheduler**: Create, complete, or reschedule action items with contextual reminders.

---

### 📈 Analytics & Conversion Funnel

- **7-Stage End-to-End Funnel**: Tracks the entire acquisition lifecycle from raw Discovery through to Closed Won deals with granular stage-over-stage conversion rates and drop-off diagnostics.
- **Voice AI Telemetry**: Average call duration, connection rate, positive sentiment ratio, and average speech turnaround latency.
- **One-Click Export**: Streaming CSV export of all filtered lead data and call histories.

---

### 🛡 10 Pre-Flight Safety Invariants & Credentials Vault

CloseVDS enforces 10 strict pre-flight gates before executing any outbound voice call:

1. **Lead Phone Number**: Must be valid E.164 international format.
2. **Active Voice Agent**: Selected voice agent must be in `ACTIVE` state.
3. **Telephony Carrier Health**: Twilio credentials and balance verified healthy.
4. **Voice AI Provider Health**: Retell AI or Vapi runtime verified healthy.
5. **Emergency Kill Switch**: System-wide kill switch must be inactive.
6. **Do Not Call (DNC) Registry**: Number must not exist in suppression lists.
7. **Daily Volume Cap**: Account must not exceed configured daily outbound limits.
8. **Retry Cooldown Window**: Enforces minimum cooldown period between subsequent calls.
9. **Recipient Calling Hours**: Local recipient time must fall within **09:00 to 20:00**.
10. **Human Operator Approval**: Calls initiated externally or queued via n8n require explicit manual operator confirmation.

**Zero-Exposure Credential Storage**: All API keys and secrets (Twilio Auth Tokens, Retell API Keys, Vapi Keys) are encrypted at rest via AES-256-GCM. The frontend only ever receives masked identifiers (`AC•••••••••••••••••••••••••••••cdef`, `key_••••••••••••••••••••••••••3210`).

---

### 🔗 n8n Automation & Webhook Integration Gateway

- **Scoped API Keys**: Create and manage granular developer keys (`calls:read`, `calls:write`, `calls:dispatch`, `webhooks:deliver`).
- **Zero-Bypass Approval Invariant**: Outbound calls dispatched by automated workflows (e.g., n8n, Zapier) enter the `APPROVAL_REQUIRED` queue for human review.
- **Delivery Audit Logs**: Every outbound webhook is logged with HTTP status, duration, HMAC-SHA256 signature, and one-click manual retry controls.

---

## 📁 Repository Structure

```
CloseBDS Frontend/
├── app/                                # Next.js 15 App Router
│   ├── (auth)/                         # Authentication Route Group
│   │   ├── login/                      # Operator Login
│   │   ├── register/                   # Workspace Registration
│   │   ├── forgot-password/            # Password Recovery
│   │   └── reset-password/             # Password Reset
│   ├── (dashboard)/                    # Authenticated Application Shell
│   │   ├── analytics/                  # Conversion Funnel & Calling Metrics
│   │   ├── calling/                    # AI Calling Command Center
│   │   │   ├── agents/                 # Voice Agents List & Status
│   │   │   │   ├── [id]/               # Agent Details
│   │   │   │   ├── [id]/edit/          # Agent Editor
│   │   │   │   └── new/                # 11-Step Voice Agent Studio Wizard
│   │   │   ├── calls/                  # Call History & Live Queue
│   │   │   │   └── [id]/               # Call Transcript & Waveform Inspector
│   │   │   └── settings/               # Provider Config & Phone Numbers
│   │   ├── crm/                        # 9-Stage Kanban Pipeline
│   │   ├── dashboard/                  # Main Overview & Pulse Dashboard
│   │   ├── leads/                      # Lead Discovery, Import & Audit Grid
│   │   ├── operations/                 # Daily Queue, Tasks & Follow-ups
│   │   ├── outreach/                   # Multi-Channel 4-Gate Outreach Center
│   │   └── settings/                   # Workspace, Security & Kill Switch
│   ├── favicon.ico
│   ├── globals.css                     # Tailwind CSS v4 Theme & Obsidian Tokens
│   ├── layout.tsx                      # Root HTML Shell & Font Configuration
│   └── page.tsx                        # High-Conversion Public Landing Page
│
├── components/                         # Modular React 19 UI Components
│   ├── analytics/                      # Funnel Visualizers, KPI Cards & Charts
│   ├── auth/                           # Login, Register & Password Forms
│   ├── calling/                        # Call Cards, Providers, Numbers & Studio
│   │   └── voice-agent-studio/         # 11 Individual Wizard Step Components
│   ├── crm/                            # Kanban Board, Deal Modal & Timeline
│   ├── dashboard/                      # Overview Command Cards & Stats
│   ├── landing/                        # Landing Hero, Specs, Pipeline & CTA
│   ├── layout/                         # App Shell, Header, Sidebar & SafetyShield
│   ├── leads/                          # Leads Table, Filters, Detail & Import
│   ├── navigation/                     # Navigation Items Configuration
│   ├── operations/                     # Call Queue, Ready Prospects & Tasks
│   ├── outreach/                       # Composer, Queue Tabs & Approval Modal
│   ├── settings/                       # General, Safety Bounds & Kill Switch
│   ├── shared/                         # Shared Utilities & Status Indicators
│   └── ui/                             # 20+ Production UI Primitives
│       ├── alert.tsx, badge.tsx, button.tsx, card.tsx, checkbox.tsx,
│       ├── confirm-dialog.tsx, dialog.tsx, dropdown-menu.tsx, empty-state.tsx,
│       ├── icons.tsx, input.tsx, select.tsx, separator.tsx, skeleton.tsx,
│       └── table.tsx, tabs.tsx, textarea.tsx, toast.tsx, tooltip.tsx
│
├── config/                             # Centralized Design & Site Configuration
│   ├── site.ts                         # Brand Metadata & Site Manifest
│   ├── theme.ts                        # Design System Tokens (Palette, Surfaces)
│   └── typography.ts                   # Font Stacks & Type Scale
│
├── lib/                                # Utilities & Core Services
│   ├── api-client.ts                   # Type-Safe REST Client & API Namespaces
│   ├── constants.ts                    # Application Constants
│   ├── lead-import.ts                  # CSV Parsing & Field Normalization
│   ├── mappers.ts                      # Backend-to-Frontend Entity Mappers
│   ├── mock-calling-data.ts            # Realistic Fallback & Demo Fixtures
│   ├── outreach-templates.ts           # Dynamic Multi-Channel Templates
│   └── utils.ts                        # Tailwind Merge & Class Utilities
│
└── types/                              # Strict TypeScript Definitions
    ├── analytics.ts                    # Funnel, Metrics & Telemetry Types
    ├── calling.ts                      # Provider, Number, Call & Audio Types
    ├── crm.ts                          # Deal, Stage & Kanban Board Types
    ├── follow-ups.ts                   # Follow-up Schedule & Reminder Types
    ├── index.ts                        # Central Type Re-exports
    ├── leads.ts                        # Lead Record, Gap Audit & Score Types
    ├── operations.ts                   # Daily Queue & Task Types
    ├── outreach.ts                     # Sequence, Approval & Message Types
    ├── settings.ts                     # Workspace, Notification & Security Types
    └── voice-agent.ts                  # Voice Agent Studio & Lifecycle Types
```

---

## 🚀 Quickstart & Local Development

### Prerequisites

- **Node.js**: `v20.x` or higher (`v22.x` recommended)
- **Package Manager**: `npm` (v10+), `pnpm` (v9+), or `yarn`
- **Backend Service**: CloseVDS Fastify Backend running locally on port `4000` (or configured API URL)

### 1. Clone & Navigate

```bash
git clone https://github.com/Dinarxn/CloseVDS-.git
cd "CloseVDS-/CloseBDS Frontend"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment configuration file:

```bash
cp .env.example .env.local
```

Configure the environment variables in `.env.local`:

```env
# Application Brand
NEXT_PUBLIC_APP_NAME="closeVDS"
NEXT_PUBLIC_APP_CATEGORY="AI Client Acquisition OS"

# Fastify API Endpoint
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000/api/v1"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application will automatically connect to your local backend API (or gracefully utilize fallback data if the backend is offline).

---

## 🛠 Verification & Quality Commands

CloseVDS maintains strict continuous integration standards. All checks must pass with zero errors:

```bash
# 1. Typecheck: Verify strict TypeScript compilation
npm run typecheck

# 2. Lint: Validate Next.js and ESLint code standards
npm run lint

# 3. Production Build: Compile and optimize Next.js App Router
npm run build

# 4. Production Start: Run optimized production bundle locally
npm run start
```

---

## 🔒 Security & Compliance

CloseVDS is built for responsible, compliant outbound communications:

- **TCPA & Local Regulatory Adherence**: Enforces mandatory calling windows based on the prospect's recipient timezone (default: **09:00 to 20:00**).
- **Suppression & DNC Enforcement**: Hard rejection of any prospect whose phone or email is flagged on internal or regulatory Do-Not-Contact lists.
- **Zero-Bypass Human Gate**: Automated workflow triggers (via n8n or public webhooks) cannot dispatch calls or messages without explicit human operator confirmation.
- **One-Way Credential Masking**: Telephony and Voice AI credentials never leak to the client bundle. Only masked fingerprints are returned by the API.
- **Emergency Kill Switch**: Operators can instantly halt all active queues and ongoing voice calls with a single authenticated action from the settings panel or header.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Engineered with precision for modern B2B client acquisition teams. Built by the CloseVDS Engineering Team.</sub>
</div>
