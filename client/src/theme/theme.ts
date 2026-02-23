import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    brand: {
      navy: string;
      amber: string;
      cream: string;
      charcoal: string;
    };
  }
  interface PaletteOptions {
    brand?: {
      navy?: string;
      amber?: string;
      cream?: string;
      charcoal?: string;
    };
  }
}

const BRAND = {
  navy: '#0D1B2A',
  navyLight: '#1B2E42',
  amber: '#E8A045',
  amberLight: '#F0B96A',
  cream: '#FAF7F2',
  charcoal: '#2D3748',
  white: '#FFFFFF',
};

export const theme = createTheme({
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  palette: {
    mode: 'light',
    primary: {
      main: BRAND.navy,
      light: BRAND.navyLight,
      dark: '#060D14',
      contrastText: BRAND.white,
    },
    secondary: {
      main: BRAND.amber,
      light: BRAND.amberLight,
      dark: '#C4832A',
      contrastText: BRAND.navy,
    },
    background: {
      default: BRAND.cream,
      paper: BRAND.white,
    },
    text: {
      primary: BRAND.charcoal,
      secondary: '#718096',
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
  shape: {
    borderRadius: 12,
  },
  shadows: [
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
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: BRAND.cream,
        },
        '::-webkit-scrollbar': {
          width: '6px',
        },
        '::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '::-webkit-scrollbar-thumb': {
          background: alpha(BRAND.navy, 0.3),
          borderRadius: '3px',
        },
      },
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
            transform: 'translateY(-1px)',
            boxShadow: `0 8px 24px ${alpha(BRAND.navy, 0.35)}`,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${BRAND.amber} 0%, ${BRAND.amberLight} 100%)`,
          color: BRAND.navy,
          '&:hover': {
            background: `linear-gradient(135deg, ${BRAND.amberLight} 0%, ${BRAND.amber} 100%)`,
            transform: 'translateY(-1px)',
            boxShadow: `0 8px 24px ${alpha(BRAND.amber, 0.4)}`,
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
            backgroundColor: BRAND.white,
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
          boxShadow: '0px 4px 24px rgba(13, 27, 42, 0.08)',
          border: '1px solid rgba(13, 27, 42, 0.06)',
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
          boxShadow: '0px 1px 8px rgba(13, 27, 42, 0.08)',
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
