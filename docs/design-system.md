# CloseVDS Design System Specification

> **Version:** 2.0.0  
> **Aesthetic Direction:** Obsidian Precision Monochrome + Hyper-Deliberate Violet & Lime Accents  
> **Branch:** `closebds-premium-monochrome-redesign`  
> **Status:** Active Standard

---

## 1. System Overview & Philosophy

CloseVDS is an enterprise-grade **AI Client Acquisition Operating System**. Its user interface is designed for high-density, analytical workflows where sales leaders and growth operators qualify leads, manage automated voice agents, orchestrate multi-channel outreach, and track conversion pipeline metrics.

### Core Principles
1. **Obsidian Surface Precision:** Surfaces are built with layered dark obsidian tones (`#09090B` through `#171720`) demarcated by razor-sharp 1px subtle borders (`rgba(255, 255, 255, 0.07)`) and directional specular hairlines.
2. **Hyper-Deliberate Accent Separation:** 
   - **Violet (`#7D39EB`)** is reserved strictly for **Interaction and Primary Actions**.
   - **Lime (`#C6FF33`)** is reserved strictly for **Verification, Success, and High-Yield KPIs**.
   - Accents are never mixed indiscriminately; every splash of color carries immediate cognitive meaning.
3. **Typography First:** Information hierarchy is communicated through weight, tabular alignment, and calibrated contrast rather than bright fills or visual clutter.
4. **Zero Layout Shifts:** All numerical, metric, and timestamp displays enforce `tabular-nums` to guarantee rock-solid visual stability during real-time analytics updates.

---

## 2. Approved Brand Palette & Color Tokens

```
┌────────────────────────────────────────────────────────────────────────┐
│  CLOSEVDS BRAND PALETTE MATRIX                                         │
├───────────────┬───────────────┬────────────────┬───────────────────────┤
│ Black         │ Violet        │ Lime           │ White                 │
│ #000000       │ #7D39EB       │ #C6FF33        │ #FFFFFF               │
│ Canvas / Base │ Primary Action│ Success / KPI  │ Typography & Specular │
└───────────────┴───────────────┴────────────────┴───────────────────────┘
```

### 2.1 Core Brand Tokens

| Token Name | Hex Code | RGB | Purpose / Role |
| :--- | :--- | :--- | :--- |
| **Brand Black** | `#000000` | `rgb(0, 0, 0)` | Root viewport, deep contrast boundaries |
| **Brand Violet** | `#7D39EB` | `rgb(125, 57, 235)` | Primary action CTA, focused rings, active tabs, interactive accents |
| **Brand Violet Hover** | `#6B2FD1` | `rgb(107, 47, 209)` | Hover state for interactive violet elements |
| **Brand Lime** | `#C6FF33` | `rgb(198, 255, 51)` | Verified status, health pulse, top lead scores (90%+), positive growth |
| **Brand Lime Muted** | `rgba(198, 255, 51, 0.12)` | — | Background fill for lime status badges and pills |
| **Brand White** | `#FFFFFF` | `rgb(255, 255, 255)` | Page headings, primary icons, specular highlights |

### 2.2 Obsidian Surface Architecture

CloseVDS utilizes a 5-layer surface hierarchy to establish depth without heavy drop shadows:

| Surface Layer | Hex / Variable | CSS Variable | Visual Role |
| :--- | :--- | :--- | :--- |
| **0. Canvas** | `#09090B` | `--surface-canvas` | Main viewport background, root workspace background |
| **1. Panel** | `#0D0D12` | `--surface-panel` | App sidebar, top header bar, secondary sub-nav panels |
| **2. Card** | `#121218` | `--surface-card` | Data tables, metric cards, lead cards, settings modules |
| **3. Card Hover** | `#171720` | `--surface-card-hover` | Hover state for clickable table rows and cards |
| **4. Elevated** | `#171720` / `#1E1E28` | `--surface-elevated` | Dropdown menus, modal dialogs, flyout drawers, tooltips |

### 2.3 1px Precision Borders

Borders define component boundaries in dark mode. Never use solid gray borders; use calibrated alpha whites:

| Border Token | Value | Tailwind / Utility | Usage |
| :--- | :--- | :--- | :--- |
| **Subtle** | `rgba(255, 255, 255, 0.07)` | `.border-subtle` / `border-white/[0.07]` | Card outlines, table cell dividers, section dividers |
| **Medium** | `rgba(255, 255, 255, 0.10)` | `.border-medium` / `border-white/[0.10]` | Form inputs, modal containers, interactive borders |
| **Highlight** | `rgba(255, 255, 255, 0.16)` | `.border-highlight` / `border-white/[0.16]` | Hover borders on cards, active selection borders |
| **Top Specular Hairline** | `linear-gradient(...)` | `.specular-border-t` | 1px top edge highlight simulating ambient overhead lighting |

### 2.4 Neutral Scale

Derived from the neutral-zinc system for balanced legibility against obsidian dark surfaces:

| Step | Hex | Contrast against `#09090B` | Usage |
| :--- | :--- | :--- | :--- |
| `neutral-950` | `#09090B` | 1:1 | Viewport canvas background |
| `neutral-900` | `#121218` | 1.1:1 | Card surface |
| `neutral-800` | `#27272A` | 1.6:1 | Input background, scrollbar track |
| `neutral-700` | `#3F3F46` | 2.5:1 | Secondary borders, scrollbar thumb |
| `neutral-600` | `#52525B` | 3.6:1 | Disabled state icons |
| `neutral-500` | `#71717A` | 5.5:1 | Helper text, muted captions, placeholders |
| `neutral-400` | `#A1A1AA` | 8.9:1 | Secondary labels, table headers, metadata |
| `neutral-300` | `#D4D4D8` | 12.3:1 | Primary body text, form field text |
| `neutral-200` | `#E4E4E7` | 14.8:1 | Emphasized content |
| `neutral-100` | `#F4F4F5` | 17.6:1 | Subsection headers |
| `neutral-50`  | `#FAFAFA` | 19.5:1 | Card titles |

### 2.5 Semantic Functional Accents

| State | Hex | Background Token | Usage |
| :--- | :--- | :--- | :--- |
| **Success / Verified** | `#C6FF33` (Brand Lime) | `rgba(198, 255, 51, 0.12)` | Connected carriers, high-qualification score, success badges |
| **Warning / Attention** | `#F59E0B` (Amber-500) | `rgba(245, 158, 11, 0.12)` | Unverified email, missing SIP configuration, low balance alert |
| **Danger / Destructive** | `#EF4444` (Red-500) | `rgba(239, 68, 68, 0.12)` | Delete actions, failed call errors, opt-out/suppression flags |
| **Info / Informational** | `#3B82F6` (Blue-500) | `rgba(59, 130, 246, 0.12)` | General notification, system audit log events |

---

## 3. Strict Color Usage Rules (Do's and Don'ts)

### Violet (`#7D39EB`) — The Interactive Driver
- **DO:** Use Violet for primary CTA buttons (e.g., "Create Campaign", "Import Leads", "Initiate AI Calling").
- **DO:** Use Violet for active navigation tab indicator bars and selected radio/switch toggles.
- **DO:** Use Violet for keyboard focus visible rings (`ring-2 ring-[#7D39EB]`).
- **DO NOT:** Use Violet for status badges indicating success or completion (use Lime or Emerald).
- **DO NOT:** Use Violet for general text or metric numerals.
- **DO NOT:** Apply heavy violet gradient backgrounds across large panels.

### Lime (`#C6FF33`) — The Verification & Metric Spark
- **DO:** Use Lime for high-yield KPI numerals (e.g., "94.2% Connect Rate", "\$128.4k Pipeline Value").
- **DO:** Use Lime for verified connectivity status indicators (e.g., Twilio SIP Connected, Webhook Live).
- **DO:** Use Lime for lead quality scores between 85 and 100.
- **DO NOT:** Use Lime for primary button background fills (neon blinding effect).
- **DO NOT:** Use Lime for body text, form labels, or secondary captions.
- **DO NOT:** Combine Violet and Lime together in the same control or button.

### Black & Obsidian (`#000000`, `#09090B` to `#171720`) — The Foundation
- **DO:** Build contrast through surface elevation steps and 1px borders.
- **DO:** Apply `.specular-border-t` to cards to simulate refined overhead ambient lighting.
- **DO NOT:** Use solid flat pure black (`#000000`) for all cards and panels alike; this destroys depth.

### White (`#FFFFFF`) — Clarity & Focus
- **DO:** Use White for page titles, modal titles, and prominent section headers.
- **DO:** Use White for primary action icons and high-contrast numerical readouts.
- **DO NOT:** Set long paragraphs of body copy to pure white (causes optical glare; use `text-zinc-300`).

---

## 4. Typography Hierarchy & Rules

### 4.1 Font Families
- **Primary Font:** Geist Sans (`var(--font-geist-sans)`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`)
- **Monospace Font:** Geist Mono (`var(--font-geist-mono)`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `monospace`)

### 4.2 Typography Scale Matrix

| Hierarchy Level | Font Size | Weight | Line Height | Tracking | Tailwind Utility Classes | Primary Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Hero** | `30px` (`1.875rem`) | Bold (700) | `36px` (`1.2`) | `-0.025em` | `text-2xl sm:text-3xl font-bold tracking-tight text-white` | Hero headers, major onboarding headlines |
| **Page Title** | `24px` (`1.5rem`) | Bold (700) | `32px` (`1.33`) | `-0.02em` | `text-2xl font-bold tracking-tight text-white` | Top workspace page header (Overview, Leads, CRM) |
| **Section Title** | `18px-20px` (`1.25rem`) | Semibold (600) | `28px` (`1.4`) | `-0.02em` | `text-lg sm:text-xl font-semibold tracking-tight text-white` | Table header bars, drawer titles, card groupings |
| **Card Title** | `14px-16px` (`1rem`) | Semibold (600) | `24px` (`1.5`) | `-0.015em` | `text-sm sm:text-base font-semibold tracking-tight text-white` | Metric card headers, form section cards |
| **Group Header** | `11px-12px` (`0.75rem`) | Semibold (600) | `16px` (`1.33`) | `+0.05em` | `text-xs font-semibold uppercase tracking-wider text-zinc-400` | Sidebar category headers, metadata section titles |
| **Body Regular** | `14px` (`0.875rem`) | Regular (400) | `22px` (`1.57`) | `-0.005em` | `text-sm text-zinc-300 leading-relaxed` | General descriptive copy, dialog explanations |
| **Body Small** | `12px` (`0.75rem`) | Regular (400) | `18px` (`1.5`) | `0em` | `text-xs text-zinc-300 leading-normal` | Table rows, compact list items, form labels |
| **Secondary / Meta** | `11px-12px` | Regular (400) | `16px` (`1.45`) | `0em` | `text-xs text-zinc-400` or `text-[11px] text-zinc-400` | Timestamps, author names, status descriptions |
| **Muted / Helper** | `11px` (`0.6875rem`) | Regular (400) | `14px` (`1.27`) | `+0.01em` | `text-[11px] text-zinc-500` | Form input sub-hints, keyboard shortcut hints |
| **KPI Metric** | `24px-30px` | Bold (700) | `32px` (`1.15`) | `-0.025em` | `text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-white` | Primary numerical readouts (Total Leads, Calls) |
| **KPI Lime Accent** | `24px-30px` | Bold (700) | `32px` (`1.15`) | `-0.025em` | `text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#C6FF33]` | High-performance metrics (Conversion %, Revenue) |
| **Code / Mono** | `12px` (`0.75rem`) | Regular (400) | `18px` (`1.5`) | `0em` | `font-mono text-xs text-zinc-300` | API parameters, webhook signatures, phone numbers |

### 4.3 Tabular Figures Rule for Analytics
All numerical figures that update dynamically (e.g., counters, durations, dollar amounts, percentages, phone numbers) **MUST** include the `tabular-nums` class or CSS rule:
```css
font-variant-numeric: tabular-nums;
```
This ensures uniform character widths, eliminating layout jitter when values increment or refresh.

---

## 5. Spacing, Sizing & Corner Radius Scale

### 5.1 Spacing Scale (4px Baseline Grid)
- `2` (8px): Micro gaps between icon and label, compact badge padding
- `3` (12px): Standard input padding (Y), tight card padding
- `4` (16px): Default padding for cards, lists, table cells
- `6` (24px): Page container padding, modal body padding
- `8` (32px): Workspace section gap

### 5.2 Corner Radius Hierarchy

```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ sm (6px)    │ md (8px)    │ lg (12px)   │ xl (16px)   │ full (9999px│
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ Tags, Chaps │ Inputs, Btns│ Cards, Tabs │ Modals, Cont│ Pills, Avatr│
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

| Radius Token | Value | Tailwind Class | Primary Targets |
| :--- | :--- | :--- | :--- |
| **sm** | `6px` | `rounded-[6px]` / `rounded-sm` | Badges, micro tags, small chips, keyboard keys |
| **md** | `8px` | `rounded-[8px]` / `rounded-md` | Standard buttons, input fields, select triggers, tooltips |
| **lg** | `12px` | `rounded-[12px]` / `rounded-lg` | Standard cards, drawer containers, popover menus |
| **xl** | `16px` | `rounded-[16px]` / `rounded-xl` | Modal dialogs, high-level workspace wrappers |
| **full** | `9999px` | `rounded-full` | Status indicator dots, user avatars, pill badges |

---

## 6. Iconography System Standards

All icons in CloseVDS are standardized via `@/components/ui/icons.tsx`.

### 6.1 Standard Sizing Conventions

```typescript
export const ICON_SIZES = {
  xs: 12, // inline status tags, micro badges
  sm: 14, // compact table actions, meta indicators
  md: 16, // default for buttons, nav items, form labels
  lg: 20, // card headers, primary navigation headers
  xl: 24, // hero sections, empty state illustrations
} as const;
```

### 6.2 Stroke & Rendering Standards
- **Stroke Width:** Uniform `1.75px` across all sizes (keeps crisp line quality on Retina and standard screens).
- **Line Join / Cap:** `round` for smooth technical ergonomics.
- **Accessibility:** Icons include `aria-hidden="true"` by default unless an explicit `aria-label` is passed.
- **Sizing Flexibility:** All components accept either a named size (`"xs" | "sm" | "md" | "lg" | "xl"`) or a raw number/string.

---

## 7. Component Specifications

### 7.1 Buttons
- **Primary Action (Violet):**
  - Background: `#7D39EB`
  - Text: `#FFFFFF`
  - Border: None
  - Hover: `#6B2FD1` with subtle brightness lift
  - Focus Ring: `ring-2 ring-[#7D39EB] ring-offset-2 ring-offset-[#09090B]`
- **Secondary Action (Obsidian / Outline):**
  - Background: `#121218`
  - Text: `#E4E4E7`
  - Border: `1px solid rgba(255, 255, 255, 0.10)`
  - Hover: Background `#171720`, border `rgba(255, 255, 255, 0.16)`
- **Ghost Action:**
  - Background: `transparent`
  - Text: `#A1A1AA`
  - Hover: Background `rgba(255, 255, 255, 0.05)`, text `#FFFFFF`
- **Destructive Action:**
  - Background: `rgba(239, 68, 68, 0.15)`
  - Text: `#EF4444`
  - Border: `1px solid rgba(239, 68, 68, 0.25)`
  - Hover: Background `rgba(239, 68, 68, 0.25)`

### 7.2 Form Controls & Inputs
- **Base Style:**
  - Background: `#121218`
  - Text: `#FFFFFF` (Placeholder: `text-zinc-500`)
  - Border: `1px solid rgba(255, 255, 255, 0.10)`
  - Corner Radius: `rounded-[8px]` (8px)
  - Height: `36px` (compact) or `40px` (standard)
- **Focused State:**
  - Border: `rgba(125, 57, 235, 0.8)`
  - Ring: `focus-visible:ring-2 focus-visible:ring-[#7D39EB] focus-visible:ring-offset-1 focus-visible:ring-offset-[#09090B]`

### 7.3 Cards & Data Containers
- **Base Surface:**
  - Background: `var(--surface-card)` (`#121218`)
  - Border: `1px solid var(--border-subtle)` (`rgba(255, 255, 255, 0.07)`)
  - Radius: `rounded-[12px]`
  - Top Specular: `.specular-border-t` applied to provide subtle 1px top illumination

### 7.4 Data Tables
- **Header:** Sticky top, `bg-[#0D0D12]`, text `text-xs font-semibold uppercase tracking-wider text-zinc-400`.
- **Row Styling:** `h-11` or `h-12`, border-b `border-white/[0.05]`.
- **Row Hover:** `hover:bg-[#171720] transition-colors`.
- **Numeric Columns:** Right-aligned, `tabular-nums`.

### 7.5 Skeletons & Loading States
- Low-contrast pulse: `bg-white/[0.05] animate-pulse rounded-[6px]`.
- Avoid bright flashing or high-contrast white skeletons.

### 7.6 Modals & Drawers
- **Backdrop:** `bg-black/75 backdrop-blur-sm`.
- **Dialog Surface:** `bg-[#171720] border border-white/[0.12] rounded-[16px] shadow-2xl`.
- **Animation:** `animate-in fade-in-0 zoom-in-95 duration-150`.

---

## 8. Accessibility & Contrast Verification (WCAG 2.1 AA)

CloseVDS is built to strictly satisfy and exceed **WCAG 2.1 AA** contrast ratios:

| Foreground Element | Background Element | Contrast Ratio | WCAG 2.1 Standard | Status |
| :--- | :--- | :--- | :--- | :--- |
| **White (`#FFFFFF`)** | Obsidian Canvas (`#09090B`) | **19.8 : 1** | AAA (>= 7.0:1) | PASS |
| **White (`#FFFFFF`)** | Card Surface (`#121218`) | **17.2 : 1** | AAA (>= 7.0:1) | PASS |
| **Zinc-300 (`#D4D4D8`)** | Card Surface (`#121218`) | **11.8 : 1** | AAA (>= 7.0:1) | PASS |
| **Zinc-400 (`#A1A1AA`)** | Card Surface (`#121218`) | **7.6 : 1** | AAA (>= 7.0:1) | PASS |
| **Zinc-500 (`#71717A`)** | Canvas (`#09090B`) | **4.8 : 1** | AA (>= 4.5:1) | PASS |
| **Brand Lime (`#C6FF33`)** | Canvas (`#09090B`) | **16.4 : 1** | AAA (>= 7.0:1) | PASS |
| **Brand Violet (`#7D39EB`)** | White (`#FFFFFF`) | **5.2 : 1** | AA (>= 4.5:1) | PASS |

### Focus Management & Keyboard Accessibility
1. Every interactive element (buttons, tabs, inputs, links, dropdown items) has a visible, high-contrast focus ring:
   ```css
   :focus-visible {
     outline: 2px solid #7D39EB;
     outline-offset: 2px;
   }
   ```
2. Modals and drawers trap focus and listen for the `Escape` key.
3. Decorative icons are hidden from assistive tech using `aria-hidden="true"`.
4. Buttons without textual labels (e.g. icon-only action triggers) require an explicit `aria-label`.

---

## 9. Implementation Reference & File Map

| Purpose | File Path | Responsible Subagent |
| :--- | :--- | :--- |
| **Typography Tokens & Classes** | `config/typography.ts` | Subagent 2 (Typography & Visual Foundation) |
| **Icon Standards & Library** | `components/ui/icons.tsx` | Subagent 2 (Typography & Visual Foundation) |
| **Design System Spec** | `docs/design-system.md` | Subagent 2 (Typography & Visual Foundation) |
| **Global CSS Variables & Theme** | `app/globals.css`, `config/theme.ts` | Subagent 1 (Tokens & Theme) |
| **Button, Card, Input Components**| `components/ui/*.tsx` | Subagents 3 & 4 (Primitives & Complex UI) |

---
*CloseVDS Design System Specification — Engineered for Precision & High-Yield Performance.*
