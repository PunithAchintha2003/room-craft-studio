import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/app/store';
import { DesignerRouter } from '@/router/index';
import { fetchDesignerUser } from '@/features/auth/authSlice';
import Cookies from 'js-cookie';
import { ThemeModeProvider } from '@/theme/ThemeModeProvider';

const AppContent: React.FC = () => {
  useEffect(() => {
    const token = Cookies.get('designerAccessToken');
    if (token) {
      store.dispatch(fetchDesignerUser());
    }
  }, []);

  return (
    <>
      <DesignerRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.875rem',
            background: '#1F2937',
            color: '#F9FAFB',
            border: '1px solid rgba(55,65,81,0.6)',
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
