import { createTheme, alpha } from '@mui/material/styles';
import { BRAND, SEMANTIC, GLASS, TEXT, TYPOGRAPHY, SHAPE, SHADOWS } from './tokens';

import type { PaletteMode } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    brand: {
      navy: string;
      amber: string;
      cream: string;
      charcoal: string;
    };
    glass: {
      background: string;
      border: string;
      blur: number;
    };
    on: {
      primary: string;
      secondary: string;
      surface: string;
      error: string;
      glass: string;
    };
  }
  interface PaletteOptions {
    brand?: {
      navy?: string;
      amber?: string;
      cream?: string;
      charcoal?: string;
    };
    glass?: {
      background?: string;
      border?: string;
      blur?: number;
    };
    on?: {
      primary?: string;
      secondary?: string;
      surface?: string;
      error?: string;
      glass?: string;
    };
  }
}

const createPaletteForMode = (mode: PaletteMode) => {
  if (mode === 'dark') {
    return {
      mode: 'dark' as const,
      primary: {
        main: BRAND.navy,
        light: BRAND.navyLight,
        dark: '#115E59',
        contrastText: BRAND.white,
      },
      secondary: {
        main: BRAND.amber,
        light: BRAND.amberLight,
        dark: '#0891B2',
        contrastText: BRAND.charcoal,
      },
      background: {
        default: SEMANTIC.dark.backgroundDefault,
        paper: SEMANTIC.dark.backgroundPaper,
      },
      text: {
        primary: TEXT.dark.textPrimary,
        secondary: TEXT.dark.textSecondary,
      },
      error: {
        main: '#F87171',
      },
      success: {
        main: '#4ADE80',
      },
      warning: {
        main: '#FBBF24',
      },
      brand: {
        navy: BRAND.navy,
        amber: BRAND.amber,
        cream: BRAND.cream,
        charcoal: BRAND.charcoal,
      },
      glass: {
        background: GLASS.dark.background,
        border: GLASS.dark.border,
        blur: GLASS.dark.blur,
      },
      on: {
        primary: TEXT.dark.onPrimary,
        secondary: TEXT.dark.onSecondary,
        surface: TEXT.dark.onSurface,
        error: TEXT.dark.onError,
        glass: TEXT.dark.onGlass,
      },
    };
  }

  return {
    mode: 'light' as const,
    primary: {
      main: BRAND.navy,
      light: BRAND.navyLight,
      dark: '#115E59',
      contrastText: BRAND.white,
    },
    secondary: {
      main: BRAND.amber,
      light: BRAND.amberLight,
      dark: '#0E7490',
      contrastText: BRAND.charcoal,
    },
    background: {
      default: SEMANTIC.light.backgroundDefault,
      paper: SEMANTIC.light.backgroundPaper,
    },
    text: {
      primary: TEXT.light.textPrimary,
      secondary: TEXT.light.textSecondary,
    },
    error: {
      main: '#E53E3E',
    },
    success: {
      main: '#38A169',
    },
    warning: {
      main: '#D69E2E',
    },
    brand: {
      navy: BRAND.navy,
      amber: BRAND.amber,
      cream: BRAND.cream,
      charcoal: BRAND.charcoal,
    },
    glass: {
      background: GLASS.light.background,
      border: GLASS.light.border,
      blur: GLASS.light.blur,
    },
    on: {
      primary: TEXT.light.onPrimary,
      secondary: TEXT.light.onSecondary,
      surface: TEXT.light.onSurface,
      error: TEXT.light.onError,
      glass: TEXT.light.onGlass,
    },
  };
};

const createBaseTheme = (mode: PaletteMode) =>
  createTheme({
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
    },
    palette: createPaletteForMode(mode),
    typography: TYPOGRAPHY,
    shape: SHAPE,
    shadows: SHADOWS as any,
    components: {
      MuiCssBaseline: {
        styleOverrides: (themeParam) => ({
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            scrollBehavior: 'smooth',
          },
          body: {
            backgroundColor: themeParam.palette.background.default,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          },
          '@media (prefers-reduced-transparency: reduce)': {
            '.glass-surface': {
              backdropFilter: 'none !important',
              WebkitBackdropFilter: 'none !important',
              backgroundColor:
                themeParam.palette.mode === 'light'
                  ? alpha('#FFFFFF', 0.9)
                  : alpha('#020617', 0.9),
            },
          },
          '::-webkit-scrollbar': {
            width: '0px',
            height: '0px',
          },
          '::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '::-webkit-scrollbar-thumb': {
            background: 'transparent',
            borderRadius: '0px',
          },
        }),
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            minHeight: 44,
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${BRAND.navyLight} 0%, ${BRAND.navy} 100%)`,
              transform: 'none',
              boxShadow: 'none',
            },
            '&:active': {
              transform: 'none',
            },
          },
          containedSecondary: {
            background: `linear-gradient(135deg, ${BRAND.amber} 0%, ${BRAND.amberLight} 100%)`,
            color: BRAND.charcoal,
            '&:hover': {
              background: `linear-gradient(135deg, ${BRAND.amberLight} 0%, ${BRAND.amber} 100%)`,
              transform: 'none',
              boxShadow: 'none',
            },
          },
          outlinedPrimary: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              backgroundColor: alpha(BRAND.navy, 0.04),
            },
          },
          sizeLarge: {
            padding: '14px 32px',
            fontSize: '1rem',
            minHeight: 48,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              backgroundColor:
                mode === 'light' ? BRAND.white : alpha('#020617', 0.6),
              transition: 'box-shadow 0.2s ease',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: BRAND.navy,
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${alpha(BRAND.navy, 0.12)}`,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: BRAND.navy,
                  borderWidth: 2,
                },
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: 'none',
            border:
              mode === 'light'
                ? '1px solid rgba(13, 27, 42, 0.06)'
                : '1px solid rgba(148, 163, 184, 0.25)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        },
      },
    },
  });

export const createLightTheme = () => createBaseTheme('light');

export const createDarkTheme = () => createBaseTheme('dark');

// Default export used by existing code paths; will be replaced by ThemeModeProvider.
export const theme = createLightTheme();

