import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { store, RootState } from '@/app/store';
import { ThemeModeProvider } from '@/theme/ThemeModeProvider';
import { AppRouter } from '@/router/index';
import { fetchCurrentUser } from '@/features/auth/authSlice';
import { useNotificationSocket } from '@/lib/socket';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import Cookies from 'js-cookie';

const AppContent: React.FC = () => {
  const theme = useTheme();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    const token = Cookies.get('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      store.dispatch(fetchCurrentUser());
    }
  }, []);

  useNotificationSocket(isAuthenticated);
  usePushNotifications(isAuthenticated);

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: theme.shape.borderRadius,
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.875rem',
            padding: '10px 14px',
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0px 18px 45px rgba(15, 23, 42, 0.85)'
                : '0px 18px 45px rgba(15, 23, 42, 0.18)',
          },
          success: {
            iconTheme: {
              primary: theme.palette.secondary.main,
              secondary: theme.palette.getContrastText(theme.palette.secondary.main),
            },
            ariaProps: { role: 'status', 'aria-live': 'polite' },
          },
          error: {
            iconTheme: {
              primary: theme.palette.error.main,
              secondary: theme.palette.getContrastText(theme.palette.error.main),
            },
            ariaProps: { role: 'alert', 'aria-live': 'assertive' },
          },
        }}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <ThemeModeProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ThemeModeProvider>
      </Provider>
    </HelmetProvider>
  );
};

export default App;
