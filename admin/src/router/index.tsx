import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/layout/AdminLayout';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DesignEditorPage = lazy(() => import('@/pages/DesignEditorPage'));
const DesignListPage = lazy(() => import('@/pages/DesignListPage'));
const UserManagementPage = lazy(() => import('@/pages/UserManagementPage'));
const DesignerManagementPage = lazy(() => import('@/pages/DesignerManagementPage'));
const FurnitureManagerPage = lazy(() => import('@/pages/FurnitureManagerPage'));
const ReviewManagementPage = lazy(() => import('@/pages/ReviewManagementPage'));
const OrderManagementPage = lazy(() => import('@/pages/OrderManagementPage'));

const PageLoader: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <CircularProgress color="primary" />
  </Box>
);

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export const AdminRouter: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/designs" element={<DesignListPage />} />
        <Route path="/editor" element={<DesignEditorPage />} />
        <Route path="/editor/:id" element={<DesignEditorPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/designers" element={<DesignerManagementPage />} />
        <Route path="/furniture" element={<FurnitureManagerPage />} />
        <Route path="/reviews" element={<ReviewManagementPage />} />
        <Route path="/orders" element={<OrderManagementPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default AdminRouter;
