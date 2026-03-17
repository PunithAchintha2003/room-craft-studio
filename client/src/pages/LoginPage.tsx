import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  ArrowBack,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { loginUser, clearError } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/theme/ThemeModeProvider';
import { BACKGROUND } from '@/theme/tokens';
import { loginSchema, LoginFormData } from '@/utils/validators';
import { notify } from '@/lib/notifications';

const MotionBox = motion.create(Box);

export const LoginPage: React.FC = () => {
  const theme = useTheme();
  const { resolvedMode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  useEffect(() => {
    if (error) {
      notify.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      notify.success('Welcome back!');
    }
  };

  const isDark = resolvedMode === 'dark';
  const pageBg = isDark
    ? `linear-gradient(135deg, ${BACKGROUND.dark.primary} 0%, ${BACKGROUND.dark.secondary} 50%, #020617 100%)`
    : `linear-gradient(135deg, ${BACKGROUND.light.primary} 0%, ${BACKGROUND.light.secondary} 40%, #E5E7EB 100%)`;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: pageBg,
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: { xs: 280, sm: 400, md: 500 },
          height: { xs: 280, sm: 400, md: 500 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, isDark ? 0.15 : 0.12)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: { xs: 200, sm: 280, md: 350 },
          height: { xs: 200, sm: 280, md: 350 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <IconButton
        onClick={toggleMode}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 2,
          color: isDark ? alpha('#FFFFFF', 0.8) : theme.palette.text.secondary,
          '&:hover': {
            color: isDark ? '#FFFFFF' : theme.palette.text.primary,
            bgcolor: isDark ? alpha('#FFFFFF', 0.08) : alpha(theme.palette.primary.main, 0.06),
          },
        }}
      >
        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </IconButton>

      <MotionBox
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        sx={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: theme.palette.glass.background,
          border: `1px solid ${theme.palette.glass.border}`,
          backdropFilter: `blur(${theme.palette.glass.blur}px)`,
          WebkitBackdropFilter: `blur(${theme.palette.glass.blur}px)`,
          borderRadius: 4,
          p: { xs: 3, sm: 5 },
          boxShadow: 'none',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack />}
          size="small"
          sx={{ mb: 3, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          Back to home
        </Button>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              component="img"
              src="/rcs_logo_circular.svg"
              alt="RoomCraft Studio"
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main' }}>
              RoomCraft Studio
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Don&apos;t have an account?{' '}
            <MuiLink component={Link} to="/register" color="primary" fontWeight={600}>
              Create one free
            </MuiLink>
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Login form"
        >
          <Stack spacing={2.5}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  type="email"
                  fullWidth
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  inputProps={{ 'aria-label': 'Email address', 'aria-required': 'true' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined sx={{ color: 'text.disabled', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  inputProps={{ 'aria-label': 'Password', 'aria-required': 'true' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: 'text.disabled', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value ?? false}
                        size="small"
                        color="primary"
                        inputProps={{ 'aria-label': 'Remember me' }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Remember me
                      </Typography>
                    }
                  />
                )}
              />
              <MuiLink
                component={Link}
                to="/forgot-password"
                variant="body2"
                color="primary"
                fontWeight={600}
              >
                Forgot password?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isLoading || isSubmitting}
              sx={{ py: 1.75 }}
              aria-label="Sign in"
            >
              {isLoading || isSubmitting ? 'Signing In…' : 'Sign In'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            New here?{' '}
            <MuiLink component={Link} to="/register" color="primary" fontWeight={600}>
              Sign up
            </MuiLink>
          </Typography>
        </Box>
      </MotionBox>
    </Box>
  );
};

export default LoginPage;
