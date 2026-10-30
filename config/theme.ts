/**
 * CloseVDS Design System Tokens
 * Approved Brand Palette: Black (#000000) + Violet (#7D39EB) + Lime (#C6FF33) + White (#FFFFFF)
 */

export const brandColors = {
  black: "#000000",
  white: "#FFFFFF",
  violet: {
    DEFAULT: "#7D39EB",
    primary: "#7D39EB",
    hover: "#6C2FD1",
    active: "#5D25B8",
    subtle: "rgba(125, 57, 235, 0.12)",
    border: "rgba(125, 57, 235, 0.35)",
    glow: "rgba(125, 57, 235, 0.25)",
  },
  lime: {
    DEFAULT: "#C6FF33",
    primary: "#C6FF33",
    subtle: "rgba(198, 255, 51, 0.12)",
    border: "rgba(198, 255, 51, 0.28)",
    glow: "rgba(198, 255, 51, 0.20)",
  },
} as const;

export const neutralColors = {
  950: "#000000", // True canvas background
  900: "#0A0A0E", // Panel & sidebar background
  850: "#111116", // Card background
  800: "#171720", // Card hover / elevated container / input background
  750: "#1D1D28", // Elevated surface / modal / dropdown background
  700: "#262634", // Borders subtle (equivalent alpha: rgba(255, 255, 255, 0.08))
  600: "#363646", // Borders medium (equivalent alpha: rgba(255, 255, 255, 0.14))
  500: "#565668", // Borders highlight / disabled text
  400: "#8E8E9F", // Muted / tertiary text
  300: "#CBCBD6", // Secondary text
  200: "#E6E6ED", // Sub-headings / high-contrast secondary
  100: "#F4F4F7", // Near-white accent neutral
  50: "#FFFFFF",  // True white
} as const;

export const surfaceTokens = {
  canvas: "#000000",      // Neutral 950: True canvas background
  panel: "#0A0A0E",       // Neutral 900: Panel and sidebar background
  card: "#111116",        // Neutral 850: Default card container background
  cardHover: "#171720",   // Neutral 800: Card hover / elevated container
  elevated: "#1D1D28",    // Neutral 750: Elevated surface / modal / dropdown background
  input: "#171720",       // Neutral 800: Input background
} as const;

export const borderTokens = {
  subtle: "rgba(255, 255, 255, 0.08)",    // Neutral 700 tone
  medium: "rgba(255, 255, 255, 0.14)",    // Neutral 600 tone
  highlight: "rgba(255, 255, 255, 0.22)", // Neutral 500 tone
  violet: "rgba(125, 57, 235, 0.35)",     // Violet boundary
  lime: "rgba(198, 255, 51, 0.28)",       // Lime boundary
} as const;

export const textTokens = {
  primary: "#FFFFFF",      // True white for primary text & headings
  subheading: "#E6E6ED",   // Neutral 200 for sub-headings & section labels
  secondary: "#CBCBD6",    // Neutral 300 for readable secondary copy
  muted: "#8E8E9F",        // Neutral 400 for tertiary / metadata text
  subtle: "#565668",       // Neutral 500 for subtle / placeholder / disabled text
  violet: "#7D39EB",       // Violet brand text
  lime: "#C6FF33",         // Lime brand text
} as const;

export const semanticTokens = {
  brand: {
    DEFAULT: "#7D39EB",
    primary: "#7D39EB",
    hover: "#6C2FD1",
    active: "#5D25B8",
    surface: "rgba(125, 57, 235, 0.12)",
    border: "rgba(125, 57, 235, 0.35)",
    text: "#7D39EB",
    foreground: "#FFFFFF",
  },
  success: {
    DEFAULT: "#C6FF33",
    primary: "#C6FF33",
    surface: "rgba(198, 255, 51, 0.12)",
    border: "rgba(198, 255, 51, 0.28)",
    text: "#C6FF33",
    foreground: "#000000",
  },
  warning: {
    DEFAULT: "#F59E0B",
    primary: "#F59E0B",
    surface: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.25)",
    text: "#FCD34D",
    foreground: "#FFFFFF",
  },
  danger: {
    DEFAULT: "#F43F5E",
    primary: "#F43F5E",
    surface: "rgba(244, 63, 94, 0.12)",
    border: "rgba(244, 63, 94, 0.25)",
    text: "#FDA4AF",
    foreground: "#FFFFFF",
  },
  info: {
    DEFAULT: "#06B6D4",
    primary: "#06B6D4",
    surface: "rgba(6, 182, 212, 0.12)",
    border: "rgba(6, 182, 212, 0.25)",
    text: "#67E8F9",
    foreground: "#FFFFFF",
  },
} as const;

export const radiusTokens = {
  none: "0px",
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "10px",
  xl: "12px",
  "2xl": "16px",
  full: "9999px",
} as const;

export const shadowTokens = {
  none: "none",
  xs: "0 1px 2px rgba(0, 0, 0, 0.5)",
  sm: "0 1px 3px rgba(0, 0, 0, 0.5)",
  card: "0 1px 3px rgba(0, 0, 0, 0.5)",
  elevated: "0 4px 20px rgba(0, 0, 0, 0.6)",
  modal: "0 20px 40px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.1)",
  glowViolet: "0 0 20px -4px rgba(125, 57, 235, 0.35)",
  glowLime: "0 0 20px -4px rgba(198, 255, 51, 0.25)",
} as const;

export const transitionTokens = {
  fast: "100ms cubic-bezier(0.16, 1, 0.3, 1)",
  normal: "150ms cubic-bezier(0.16, 1, 0.3, 1)",
  slow: "250ms cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export type BrandColors = typeof brandColors;
export type NeutralColors = typeof neutralColors;
export type SurfaceTokens = typeof surfaceTokens;
export type BorderTokens = typeof borderTokens;
export type TextTokens = typeof textTokens;
export type SemanticTokens = typeof semanticTokens;
export type RadiusTokens = typeof radiusTokens;
export type ShadowTokens = typeof shadowTokens;
export type TransitionTokens = typeof transitionTokens;

export const theme = {
  brandColors,
  neutralColors,
  surfaceTokens,
  borderTokens,
  textTokens,
  semanticTokens,
  radiusTokens,
  shadowTokens,
  transitionTokens,
} as const;

export default theme;
