/**
 * CloseVDS Typography Tokens & Visual Hierarchy
 *
 * Designed for High-Density AI Client Acquisition Workspaces.
 * Optimized for Geist Sans with strict tabular numerals for analytics and KPI metrics.
 *
 * Approved Brand Palette:
 * - Black:  #000000 (Canvas & Surface Base)
 * - Violet: #7D39EB (Interactive / Primary Action)
 * - Lime:   #C6FF33 (Success / Active KPI / Verified Status)
 * - White:  #FFFFFF (Foreground Headings & Specular Accents)
 */

export const fontFamilies = {
  sans: "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const letterSpacings = {
  tighter: "-0.04em",
  tight: "-0.025em",
  snug: "-0.015em",
  normal: "-0.01em", // default subtle tracking for clean SaaS display
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
} as const;

export const lineHeights = {
  none: "1",
  tight: "1.2",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
} as const;

export interface TypographyToken {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight: string;
  description: string;
}

export const typographyScale = {
  display: {
    fontSize: "1.875rem", // 30px
    lineHeight: "2.25rem",
    letterSpacing: "-0.025em",
    fontWeight: fontWeights.bold,
    description: "Hero headers, major modal banners",
  },
  h1: {
    fontSize: "1.5rem", // 24px
    lineHeight: "2rem",
    letterSpacing: "-0.02em",
    fontWeight: fontWeights.bold,
    description: "Page titles, primary workspace views",
  },
  h2: {
    fontSize: "1.25rem", // 20px
    lineHeight: "1.75rem",
    letterSpacing: "-0.02em",
    fontWeight: fontWeights.semibold,
    description: "Section titles, drawer headers",
  },
  h3: {
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem",
    letterSpacing: "-0.015em",
    fontWeight: fontWeights.semibold,
    description: "Subsection headers, large card titles",
  },
  h4: {
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem",
    letterSpacing: "-0.01em",
    fontWeight: fontWeights.semibold,
    description: "Card titles, table section headers",
  },
  body: {
    fontSize: "0.875rem", // 14px
    lineHeight: "1.375rem",
    letterSpacing: "-0.005em",
    fontWeight: fontWeights.regular,
    description: "Primary body text, form labels, data cells",
  },
  bodySm: {
    fontSize: "0.75rem", // 12px
    lineHeight: "1.125rem",
    letterSpacing: "0em",
    fontWeight: fontWeights.regular,
    description: "Secondary descriptions, compact table rows, list items",
  },
  caption: {
    fontSize: "0.6875rem", // 11px
    lineHeight: "1rem",
    letterSpacing: "0.01em",
    fontWeight: fontWeights.regular,
    description: "Helper text, footnotes, timestamps, status subtext",
  },
  kpi: {
    fontSize: "1.875rem", // 30px
    lineHeight: "2.25rem",
    letterSpacing: "-0.025em",
    fontWeight: fontWeights.bold,
    description: "Key Performance Indicator metrics, numerical counters",
  },
} as const satisfies Record<string, TypographyToken>;

/**
 * Standard Tailwind CSS class maps for CloseVDS typography hierarchy.
 * Ensures consistent visual weights, leading, tracking, and contrast across all features.
 */
export const typographyClasses = {
  // Page Title: text-2xl or text-3xl, font-bold tracking-tight text-white
  pageTitle: "text-2xl sm:text-3xl font-bold tracking-tight text-white",

  // Section Title: text-lg or text-xl, font-semibold tracking-tight text-white
  sectionTitle: "text-lg sm:text-xl font-semibold tracking-tight text-white",

  // Card Title: text-sm or text-base, font-semibold text-white tracking-tight
  cardTitle: "text-sm sm:text-base font-semibold tracking-tight text-white",

  // Subsection / Group header: text-xs, font-semibold tracking-wide uppercase text-zinc-400
  subSectionHeader: "text-xs font-semibold uppercase tracking-wider text-zinc-400",
  groupHeader: "text-xs font-semibold uppercase tracking-wider text-zinc-400",

  // Body regular: text-xs or text-sm, text-zinc-300 / neutral-300 leading-relaxed
  body: "text-sm text-zinc-300 leading-relaxed",
  bodySm: "text-xs text-zinc-300 leading-relaxed",

  // Secondary / Meta text: text-[11px] or text-xs, text-zinc-400 / neutral-400
  secondary: "text-xs text-zinc-400",
  meta: "text-[11px] text-zinc-400",

  // Muted / Helper text: text-[11px], text-zinc-500
  muted: "text-[11px] text-zinc-500",

  // KPI / Metric Numerals: font-bold tabular-nums text-white or text-brand-lime (#C6FF33)
  kpi: "text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-white",
  kpiLime: "text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#C6FF33]",
  kpiViolet: "text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#7D39EB]",
  kpiSm: "text-lg sm:text-xl font-bold tabular-nums tracking-tight text-white",
  kpiSmLime: "text-lg sm:text-xl font-bold tabular-nums tracking-tight text-[#C6FF33]",

  // Code / Monospace: font-mono text-xs
  code: "font-mono text-xs text-zinc-300",
  codeBlock: "font-mono text-xs text-zinc-300 bg-black/60 p-3 rounded-md border border-white/[0.08]",
} as const;

export type TypographyVariant = keyof typeof typographyClasses;
export type TypographyScaleLevel = keyof typeof typographyScale;

/**
 * Utility helper to retrieve standard typography classes with optional additional classNames.
 */
export function getTypography(variant: TypographyVariant, extraClass?: string): string {
  const base = typographyClasses[variant] || "";
  return extraClass ? `${base} ${extraClass}`.trim() : base;
}
