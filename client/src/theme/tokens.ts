import { TypographyOptions } from '@mui/material/styles/createTypography';

// Core brand palette – teal / cyan futuristic theme
export const BRAND = {
  // Primary brand teal (actions, highlights)
  navy: '#0F766E',
  navyLight: '#14B8A6',
  // Accent cyan (secondary actions, gradients) – kept as amber* keys for compatibility
  amber: '#06B6D4',
  amberLight: '#22D3EE',
  // Neutrals
  cream: '#F9FAFB',
  charcoal: '#020617',
  white: '#FFFFFF',
};

export const BACKGROUND = {
  light: {
    // Primary = overall page background, secondary = content section background
    primary: '#EEF2F7', // soft slate/blue-grey
    secondary: BRAND.white,
  },
  dark: {
    // Deep slate pair, futuristic but low-noise
    primary: '#020617',
    secondary: '#0B1120',
  },
} as const;

export const SEMANTIC = {
  light: {
    backgroundDefault: BACKGROUND.light.primary,
    backgroundPaper: BACKGROUND.light.secondary,
    textMuted: '#6B7280', // neutral-muted text
    borderSubtle: 'rgba(15, 23, 42, 0.06)',
    // Hero / CTA / stats styling for light mode
    heroGradient: `linear-gradient(135deg, ${BACKGROUND.light.primary} 0%, ${BACKGROUND.light.secondary} 40%, #F9FAFB 100%)`,
    ctaGradient: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 45%, ${BRAND.amberLight} 100%)`,
    statsBar: {
      background: 'rgba(255, 255, 255, 0.80)',
      border: 'rgba(148, 163, 184, 0.35)',
    },
  },
  dark: {
    backgroundDefault: BACKGROUND.dark.primary,
    backgroundPaper: BACKGROUND.dark.secondary,
    textMuted: '#94A3B8',
    borderSubtle: 'rgba(148, 163, 184, 0.35)',
    heroGradient: `linear-gradient(135deg, ${BACKGROUND.dark.primary} 0%, ${BACKGROUND.dark.secondary} 40%, #020617 100%)`,
    ctaGradient: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 100%)`,
    statsBar: {
      background: 'rgba(15, 23, 42, 0.80)',
      border: 'rgba(148, 163, 184, 0.45)',
    },
  },
};

export const GLASS = {
  light: {
    background: 'rgba(255, 255, 255, 0.78)',
    border: 'rgba(148, 163, 184, 0.30)',
    blur: 22,
  },
  dark: {
    background: 'rgba(15, 23, 42, 0.82)',
    border: 'rgba(45, 212, 191, 0.45)', // teal-tinted border
    blur: 24,
  },
} as const;

export const FEATURE_ICON_COLORS = {
  light: ['#0EA5E9', '#22C55E', '#6366F1', '#EC4899', '#F97316', '#EF4444'],
  dark: ['#38BDF8', '#4ADE80', '#A855F7', '#F472B6', '#FB923C', '#F97373'],
} as const;

export const TEXT = {
  light: {
    textPrimary: '#020617', // near-black on light backgrounds
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    onPrimary: BRAND.white,
    onSecondary: BRAND.charcoal,
    onSurface: '#020617',
    onError: BRAND.white,
    onGlass: '#020617',
  },
  dark: {
    textPrimary: '#E5E7EB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    onPrimary: '#ECFEFF',
    onSecondary: '#020617',
    onSurface: '#E5E7EB',
    onError: '#FEE2E2',
    onGlass: '#F9FAFB',
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

export const SHAPE = {
  borderRadius: 12,
};

export const SHADOWS: string[] = [
  'none',
  '0px 1px 3px rgba(13, 27, 42, 0.08)',
  '0px 4px 12px rgba(13, 27, 42, 0.10)',
  '0px 8px 24px rgba(13, 27, 42, 0.12)',
  '0px 12px 32px rgba(13, 27, 42, 0.14)',
  '0px 16px 48px rgba(13, 27, 42, 0.16)',
  '0px 20px 56px rgba(13, 27, 42, 0.18)',
  '0px 24px 64px rgba(13, 27, 42, 0.20)',
  '0px 28px 72px rgba(13, 27, 42, 0.22)',
  '0px 32px 80px rgba(13, 27, 42, 0.24)',
  '0px 36px 88px rgba(13, 27, 42, 0.26)',
  '0px 40px 96px rgba(13, 27, 42, 0.28)',
  '0px 44px 104px rgba(13, 27, 42, 0.30)',
  '0px 48px 112px rgba(13, 27, 42, 0.32)',
  '0px 52px 120px rgba(13, 27, 42, 0.34)',
  '0px 56px 128px rgba(13, 27, 42, 0.36)',
  '0px 60px 136px rgba(13, 27, 42, 0.38)',
  '0px 64px 144px rgba(13, 27, 42, 0.40)',
  '0px 68px 152px rgba(13, 27, 42, 0.42)',
  '0px 72px 160px rgba(13, 27, 42, 0.44)',
  '0px 76px 168px rgba(13, 27, 42, 0.46)',
  '0px 80px 176px rgba(13, 27, 42, 0.48)',
  '0px 84px 184px rgba(13, 27, 42, 0.50)',
  '0px 88px 192px rgba(13, 27, 42, 0.52)',
  '0px 92px 200px rgba(13, 27, 42, 0.54)',
];

