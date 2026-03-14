import { createTheme, alpha, Theme } from '@mui/material/styles';
import { BACKGROUND, BRAND, GLASS, SEMANTIC, TYPOGRAPHY } from './tokens';

export type AdminThemeMode = 'dark' | 'light';

export const createAdminTheme = (mode: AdminThemeMode = 'dark'): Theme =>
  createTheme({
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
    },
    palette: {
      mode,
      primary: {
        main: BRAND.primaryTeal,
        light: '#14B8A6',
        dark: '#0F766E',
        contrastText: BRAND.white,
      },
      secondary: {
        main: BRAND.primaryIndigo,
        light: '#818CF8',
        dark: '#4F46E5',
        contrastText: BRAND.white,
      },
      background: {
        default: mode === 'dark' ? BACKGROUND.dark.primary : BACKGROUND.light.primary,
        paper: mode === 'dark' ? BACKGROUND.dark.secondary : BACKGROUND.light.secondary,
      },
      text: mode === 'dark'
        ? {
            primary: '#F9FAFB',
            secondary: '#9CA3AF',
          }
        : {
            primary: '#020617',
            secondary: '#4B5563',
          },
      divider: BRAND.borderSoft,
      error: { main: SEMANTIC.error.main },
      success: { main: SEMANTIC.success.main },
      warning: { main: SEMANTIC.warning.main },
    },
    typography: TYPOGRAPHY,
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor:
              mode === 'dark' ? BACKGROUND.dark.primary : BACKGROUND.light.primary,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            fontSize: '0.9375rem',
            transition: 'color 0.2s ease, border-color 0.2s ease, background 0.2s ease, transform 0.2s ease',
            minHeight: 44,
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${BRAND.primaryTeal} 0%, ${BRAND.primaryIndigo} 100%)`,
            color: BRAND.white,
            '&:hover': {
              background: `linear-gradient(135deg, ${BRAND.primaryIndigo} 0%, ${BRAND.primaryTeal} 100%)`,
              transform: 'none',
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
              backgroundColor:
                mode === 'dark'
                  ? 'rgba(15, 23, 42, 0.9)'
                  : 'rgba(255, 255, 255, 0.9)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: BRAND.borderSoft },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: BRAND.primaryTeal,
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: BRAND.primaryTeal,
                  borderWidth: 2,
                },
              },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: BRAND.primaryTeal },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${mode === 'dark' ? GLASS.dark.border : GLASS.light.border}`,
            backgroundImage: 'none',
            backgroundColor:
              mode === 'dark' ? GLASS.dark.background : GLASS.light.background,
            backdropFilter: `blur(${mode === 'dark' ? GLASS.dark.blur : GLASS.light.blur}px)`,
            WebkitBackdropFilter: `blur(${
              mode === 'dark' ? GLASS.dark.blur : GLASS.light.blur
            }px)`,
          },
        },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
    },
  });

// Default theme instance (dark mode) for simple imports
export const adminTheme = createAdminTheme('dark');
