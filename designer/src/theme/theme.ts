import { createTheme, alpha, Theme } from '@mui/material/styles';
import { BACKGROUND, BRAND, GLASS, TYPOGRAPHY } from './tokens';

export type DesignerThemeMode = 'dark' | 'light';

export const createDesignerTheme = (mode: DesignerThemeMode = 'dark'): Theme =>
  createTheme({
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
    },
    palette: {
      mode,
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
        default: mode === 'dark' ? BACKGROUND.dark.primary : BACKGROUND.light.primary,
        paper: mode === 'dark' ? BACKGROUND.dark.secondary : BACKGROUND.light.secondary,
      },
      text:
        mode === 'dark'
          ? {
              primary: '#F9FAFB',
              secondary: '#9CA3AF',
            }
          : {
              primary: '#020617',
              secondary: '#4B5563',
            },
      divider: BRAND.border,
      error: { main: '#EF4444' },
      success: { main: '#10B981' },
      warning: { main: '#F59E0B' },
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
              backgroundColor: mode === 'dark' ? BRAND.surfaceLight : '#FFFFFF',
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
export const designerTheme = createDesignerTheme('dark');
