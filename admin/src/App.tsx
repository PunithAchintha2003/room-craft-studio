import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { store } from '@/app/store';
import { AdminRouter } from '@/router/index';
import { fetchAdminUser } from '@/features/auth/authSlice';
import Cookies from 'js-cookie';
import { ThemeModeProvider } from '@/theme/ThemeModeProvider';

const AppContent: React.FC = () => {
  const theme = useTheme();

  useEffect(() => {
    const token = Cookies.get('adminAccessToken');
    if (token) {
      store.dispatch(fetchAdminUser());
    }
  }, []);

  return (
    <>
      <AdminRouter />
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

const App: React.FC = () => (
  <Provider store={store}>
    <ThemeModeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeModeProvider>
  </Provider>
);

export default App;
