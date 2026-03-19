import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const WelcomePage = lazy(() => import('@/pages/WelcomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ReviewsPage = lazy(() => import('@/pages/ReviewsPage'));
const FurnitureCatalogPage = lazy(() => import('@/pages/FurnitureCatalogPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const MyDesignsPage = lazy(() => import('@/pages/MyDesignsPage'));
const DesignViewerPage = lazy(() => import('@/pages/DesignViewerPage'));
const DesignEditorPage = lazy(() => import('@/pages/DesignEditorPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const OrderHistoryPage = lazy(() => import('@/pages/OrderHistoryPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const PaymentPage = lazy(() => import('@/pages/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage'));
const PaymentFailurePage = lazy(() => import('@/pages/PaymentFailurePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <CircularProgress color="primary" />
  </Box>
);

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <Box
      component="main"
      sx={{
        flex: 1,
        mt: { xs: 9, sm: 10 },
      }}
    >
      {children}
    </Box>
    <Footer />
  </Box>
);

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box component="main">{children}</Box>
);

/** Full-viewport layout for editor: no navbar, no footer, no page scroll. */
const EditorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
    }}
  >
    {children}
  </Box>
);

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth routes — no navbar/footer */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />

        {/* Main layout routes */}
        <Route
          path="/"
          element={
            <MainLayout>
              <WelcomePage />
            </MainLayout>
          }
        />
        
        <Route
          path="/furniture"
          element={
            <MainLayout>
              <FurnitureCatalogPage />
            </MainLayout>
          }
        />

        <Route
          path="/furniture/:id"
          element={
            <MainLayout>
              <ProductDetailPage />
            </MainLayout>
          }
        />

        <Route
          path="/reviews"
          element={
            <MainLayout>
              <ReviewsPage />
            </MainLayout>
          }
        />

        <Route
          path="/about"
          element={
            <MainLayout>
              <AboutPage />
            </MainLayout>
          }
        />

        <Route
          path="/cart"
          element={
            <MainLayout>
              <CartPage />
            </MainLayout>
          }
        />

        <Route
          path="/design-viewer/:id"
          element={
            <MainLayout>
              <DesignViewerPage />
            </MainLayout>
          }
        />

        {/* Protected routes */}
        <Route
          path="/my-designs"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MyDesignsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MainLayout>
                <OrderHistoryPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PaymentPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PaymentSuccessPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/failure"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PaymentFailurePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <MainLayout>
                <WishlistPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/designer"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Box sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>Room Designer — Coming in Phase 3</Box>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <EditorLayout>
                <DesignEditorPage />
              </EditorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <EditorLayout>
                <DesignEditorPage />
              </EditorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
