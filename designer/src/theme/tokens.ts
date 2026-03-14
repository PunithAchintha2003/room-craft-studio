import { TypographyOptions } from '@mui/material/styles/createTypography';

export const BRAND = {
  navy: '#0D1B2A',
  navyLight: '#1B2E42',
  teal: '#0EA5E9',
  tealLight: '#38BDF8',
  charcoal: '#2D3748',
  white: '#FFFFFF',
  // Used for subtle borders (e.g. dividers, input outlines)
  border: 'rgba(148, 163, 184, 0.4)',
  // Slightly lifted surface for inputs on dark background
  surfaceLight: '#111827',
};

export const BACKGROUND = {
  light: {
    primary: '#F5F5F5',
    secondary: BRAND.white,
  },
  dark: {
    primary: '#050816',
    secondary: '#0B0F19',
  },
} as const;

export const GLASS = {
  light: {
    background: 'rgba(255, 255, 255, 0.72)',
    border: 'rgba(148, 163, 184, 0.28)',
    blur: 16,
  },
  dark: {
    background: 'rgba(15, 23, 42, 0.78)',
    border: 'rgba(148, 163, 184, 0.55)',
    blur: 18,
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

