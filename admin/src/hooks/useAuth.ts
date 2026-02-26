import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { clearError, clearCredentials } from '@/features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, accessToken, isLoading, isAuthenticated, error } = useSelector(
    (state: RootState) => state.auth
  );
  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    error,
    clearAuthError: () => dispatch(clearError()),
    logout: () => dispatch(clearCredentials()),
  };
};
