import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { clearError, clearCredentials } from '@/features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, accessToken, isLoading, isAuthenticated, error } = useSelector(
    (state: RootState) => state.auth
  );

  const clearAuthError = () => dispatch(clearError());
  const logout = () => dispatch(clearCredentials());

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    error,
    clearAuthError,
    logout,
  };
};
