import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CssBaseline, PaletteMode, ThemeProvider, useMediaQuery } from '@mui/material';
import { createDarkTheme, createLightTheme } from './theme';

type Mode = Exclude<PaletteMode, 'system'> | 'system';

interface ThemeModeContextValue {
  mode: Mode;
  resolvedMode: Exclude<PaletteMode, 'system'>;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'roomcraft_theme_mode';

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setModeState] = useState<Mode>('system');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setModeState(stored);
    }
  }, []);

  const resolvedMode: Exclude<PaletteMode, 'system'> =
    mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  const theme = useMemo(
    () => (resolvedMode === 'dark' ? createDarkTheme() : createLightTheme()),
    [resolvedMode]
  );

  const setMode = (next: Mode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const toggleMode = () => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  };

  const value: ThemeModeContextValue = {
    mode,
    resolvedMode,
    toggleMode,
    setMode,
  };

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return ctx;
};

