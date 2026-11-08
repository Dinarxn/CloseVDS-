# CloseVDS — Design System Audit Report

**Date**: 2026-11-08  
**Scope**: Systematic review of brand colors, neutral scale, surface hierarchy, typography, border radius, shadows, buttons, inputs, tables, modals, and interaction states.  
**Auditor Role**: Principal Design Systems Architect & Senior Frontend Engineer  
**Branch**: `closebds-premium-monochrome-redesign`

---

## 1. Approved Brand Color Token Compliance

The design system enforces four mandatory brand colors and a supporting obsidian neutral hierarchy:

| Token | Approved Value | CSS Variable / Tailwind Token | Role | Audit Finding |
| :--- | :--- | :--- | :--- | :--- |
| **Black** | `#000000` | `--color-surface-canvas`, `--color-brand-black` | Main background, shell canvas | 100% Compliant |
| **Violet** | `#7D39EB` | `--color-brand-violet`, `#7D39EB` | Primary interactive buttons, active tabs, focus rings | 100% Compliant |
| **Lime** | `#C6FF33` | `--color-brand-lime`, `#C6FF33` | Live health dots, success badges, KPI highlights | 100% Compliant |
| **White** | `#FFFFFF` | `--color-brand-white`, `text-white` | Headings, primary copy, high-contrast elements | 100% Compliant |

---

## 2. Obsidian Surface Hierarchy

CloseVDS avoids flat, featureless dark interfaces by utilizing a calibrated 5-tier neutral depth model:

```
Level 0: Canvas (#000000)
    │
    ▼
Level 1: Panel (#0A0A0E)      ──> Sidebar, persistent Top Header, Drawer backdrops
    │
    ▼
Level 2: Card (#111116)       ──> Data tables, metric cards, overview widgets
    │
    ▼
Level 3: Input/Hover (#171720)──> Form fields, table row hover, select menus
    │
    ▼
Level 4: Elevated (#1D1D28)   ──> Modals, dropdown menus, command palette, toast alerts
```

### Specular Hairline Borders
Cards and elevated containers feature subtle top specular hairlines:
```css
border: 1px solid rgba(255, 255, 255, 0.08);
background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.10), transparent);
```
This gives tactile depth without garish gradients or glowing noise.

---

## 3. Typography & Spacing Scale

### Font Family
- **Primary Body & Display**: Geist Sans (`font-sans`) via `next/font/google`.
- **Telemetry & Monospace**: Geist Mono (`font-mono`) for phone numbers, timestamps, durations, and API keys.

### Hierarchy
- **Page Titles**: `text-xl sm:text-2xl font-semibold tracking-tight text-white`
- **Section Headers**: `text-sm sm:text-base font-semibold text-white tracking-tight`
- **Card Subheadings**: `text-xs text-zinc-400 font-normal leading-relaxed`
- **Data Table Cells**: `text-xs text-zinc-300 font-sans` / `text-xs font-mono text-zinc-400`
- **Micro Labels & Badges**: `text-[10px] uppercase font-mono tracking-wider`

---

## 4. UI Primitives Evaluation

### 1. Buttons (`components/ui/button.tsx`)
- **Variants**:
  - `primary`: `#7D39EB` violet background with crisp `#8F52F5` border and white text.
  - `secondary`: `#111116` surface card with `rgba(255,255,255,0.08)` border.
  - `outline`: Transparent with subtle white border.
  - `ghost`: Transparent with hover background.
  - `destructive`: Restrained `rose-950/30` with `rose-800/50` border (not neon red).
  - `accent` / `success`: `#C6FF33` lime with dark black text for positive actions.
- **Sizes**: Standardized 4-tier heights (`xs: h-7`, `sm: h-8`, `md: h-9`, `lg: h-10`).
- **Focus Indicator**: Enforces `focus-visible:ring-2 focus-visible:ring-[#7D39EB] focus-visible:ring-offset-2 focus-visible:ring-offset-black`.

### 2. Form Inputs (`components/ui/input.tsx`, `textarea.tsx`, `select.tsx`)
- Standardized height `h-9 px-3 text-xs bg-surface-panel rounded-lg`.
- Muted border `border-white/[0.08] hover:border-white/[0.16]`.
- Active focus transitions to `border-[#7D39EB] ring-1 ring-[#7D39EB]`.

### 3. Data Tables (`components/ui/table.tsx`, `calls-table.tsx`, `leads-table.tsx`)
- Sticky headers with `bg-surface-panel/90 backdrop-blur-sm`.
- Subtle row dividing lines `border-b border-white/[0.04]`.
- Alternating or hover states utilizing `hover:bg-surface-card-hover/60`.

### 4. Modals & Dialogs (`components/ui/dialog.tsx`, `confirm-dialog.tsx`)
- Backdrop: `bg-black/80 backdrop-blur-sm`.
- Container: `bg-surface-elevated border border-white/[0.12] rounded-2xl shadow-2xl`.
- Clear header, body, and footer separation with primary action placed on the right.

### 5. Status Badges (`components/ui/badge.tsx`)
- Standardized semantic variants:
  - `default`: Neutral dark slate pill with subtle border.
  - `success`: `bg-lime-500/10 text-[#C6FF33] border-lime-500/25` with live pulse dot.
  - `violet`: `bg-violet-500/10 text-violet-300 border-violet-500/25`.
  - `warning`: `bg-amber-500/10 text-amber-300 border-amber-500/25`.
  - `error`: `bg-rose-500/10 text-rose-300 border-rose-500/25`.

---

## 5. Polish Recommendations

1. **Focus Ring Uniformity**: Ensure non-button interactive elements (e.g. icon toggles in tables, custom tabs) inherit the exact `focus-visible:ring-2 focus-visible:ring-[#7D39EB]` standard.
2. **Keyboard Accessibility**: Verify all modal trigger buttons have explicit `aria-haspopup="dialog"` and `aria-expanded` attributes where appropriate.
3. **Empty States**: Reusable `components/ui/empty-state.tsx` provides the standard template. Submodules with inline empty states should match this icon + title + description + action rhythm.

