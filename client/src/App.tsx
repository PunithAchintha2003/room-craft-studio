import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { store, RootState } from '@/app/store';
import { theme } from '@/theme/theme';
import { AppRouter } from '@/router/index';
import { fetchCurrentUser } from '@/features/auth/authSlice';
import { useNotificationSocket } from '@/lib/socket';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import Cookies from 'js-cookie';

const AppContent: React.FC = () => {
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
            borderRadius: '10px',
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#38A169', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: '#E53E3E', secondary: '#FFFFFF' },
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </HelmetProvider>
  );
};

export default App;
