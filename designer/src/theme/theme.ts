import { createTheme, alpha } from '@mui/material/styles';

const BRAND = {
  navy: '#0D1B2A',
  navyLight: '#1B2E42',
  teal: '#0EA5E9',
  tealLight: '#38BDF8',
  dark: '#0A0F1A',
  surface: '#111827',
  surfaceLight: '#1F2937',
  border: '#374151',
};

export const designerTheme = createTheme({
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: BRAND.teal,
      light: BRAND.tealLight,
      dark: '#0284C7',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B5CF6',
      light: '#A78BFA',
      dark: '#6D28D9',
      contrastText: '#FFFFFF',
    },
    background: {
      default: BRAND.dark,
      paper: BRAND.surface,
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF',
    },
    divider: BRAND.border,
    error: { main: '#EF4444' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
  },
  typography: {
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
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: BRAND.dark },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          transition: 'all 0.2s ease',
          minHeight: 44,
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${BRAND.teal} 0%, ${BRAND.tealLight} 100%)`,
          color: '#FFFFFF',
          '&:hover': {
            background: `linear-gradient(135deg, ${BRAND.tealLight} 0%, ${BRAND.teal} 100%)`,
            transform: 'translateY(-1px)',
            boxShadow: `0 8px 24px ${alpha(BRAND.teal, 0.4)}`,
          },
        },
        sizeLarge: { padding: '14px 32px', fontSize: '1rem', minHeight: 48 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: BRAND.surfaceLight,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: BRAND.border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: BRAND.teal },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(BRAND.teal, 0.15)}`,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: BRAND.teal,
                borderWidth: 2,
              },
            },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: BRAND.teal },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${BRAND.border}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
  },
});
