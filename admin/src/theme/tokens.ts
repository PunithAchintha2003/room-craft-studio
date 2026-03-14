import { TypographyOptions } from '@mui/material/styles/createTypography';

// Core brand palette (shared across modes)
export const BRAND = {
  // Primary brand cyber teal (navy)
  primaryTeal: '#0F766E',
  // Primary brand futuristic indigo
  primaryIndigo: '#6366F1',
  // Accent neon cyan
  accentCyan: '#67E8F9',
  // Accent neon purple
  accentPurple: '#C084FC',
  // Neutrals
  slateDark: '#0F172A',
  charcoal: '#020617',
  white: '#FFFFFF',
  // Subtle borders (e.g. dividers, input outlines)
  borderSoft: 'rgba(148, 163, 184, 0.35)',
} as const;

// Background and surface tokens for dark/light modes
export const BACKGROUND = {
  dark: {
    primary: BRAND.charcoal, // page background
    secondary: BRAND.slateDark, // cards / panels
  },
  light: {
    primary: '#F3F4F6',
    secondary: BRAND.white,
  },
} as const;

// Glassmorphism surfaces for dark/light modes
export const GLASS = {
  dark: {
    background: 'rgba(15, 23, 42, 0.88)',
    border: 'rgba(103, 232, 249, 0.55)', // cyan accent border
    blur: 18,
  },
  light: {
    background: 'rgba(255, 255, 255, 0.85)',
    // Darker, more defined border for light mode cards
    border: 'rgba(15, 23, 42, 0.35)',
    blur: 16,
  },
} as const;

// Semantic color tokens (non-amber)
export const SEMANTIC = {
  success: {
    main: '#22C55E',
    softBg: 'rgba(34, 197, 94, 0.14)',
  },
  warning: {
    // Cool, modern orange without amber feel
    main: '#FB923C',
    softBg: 'rgba(251, 146, 60, 0.16)',
  },
  error: {
    main: '#EF4444',
    softBg: 'rgba(239, 68, 68, 0.16)',
  },
} as const;

export const TYPOGRAPHY: TypographyOptions = {
  fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
  fontSize: 16,
  htmlFontSize: 16,
  h1: {
    fontWeight: 800,
    fontSize: '3rem',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
  },
  h2: {
    fontWeight: 700,
    fontSize: '2.25rem',
    lineHeight: 1.15,
    letterSpacing: '-0.025em',
  },
  h3: {
    fontWeight: 700,
    fontSize: '1.875rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.3,
    letterSpacing: '-0.015em',
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h6: {
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  subtitle1: {
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  subtitle2: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    letterSpacing: '0.006em',
  },
  body1: {
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.75,
    letterSpacing: '0em',
  },
  body2: {
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.65,
    letterSpacing: '0em',
  },
  caption: {
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.5,
    letterSpacing: '0.025em',
  },
  overline: {
    fontWeight: 600,
    fontSize: '0.6875rem',
    lineHeight: 1.5,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  button: {
    fontWeight: 600,
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    letterSpacing: '0.01em',
    textTransform: 'none',
  },
};

