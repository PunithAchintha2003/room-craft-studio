import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  DesignServices,
  ArrowForward,
  OpenInNew,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { designerLogin, clearError } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, LoginFormData } from '@/utils/validators';
import { useThemeMode } from '@/theme/ThemeModeProvider';
import { BACKGROUND } from '@/theme/tokens';

const MotionBox = motion.create(Box);

export const LoginPage: React.FC = () => {
  const theme = useTheme();
  const { resolvedMode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(designerLogin(data));
    if (designerLogin.fulfilled.match(result)) {
      toast.success('Welcome back!');
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
        background: pageBg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top-right theme toggle */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton
          size="small"
          onClick={toggleMode}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          sx={{
            borderRadius: 999,
            color: isDark ? alpha(theme.palette.text.primary, 0.8) : theme.palette.text.secondary,
            border: '0 !important',
            boxShadow: 'none !important',
            outline: 'none !important',
            backgroundColor: 'transparent',
            '&:hover': {
              color: theme.palette.text.primary,
              bgcolor: isDark
                ? alpha(theme.palette.primary.main, 0.16)
                : alpha(theme.palette.primary.main, 0.06),
              border: '0 !important',
              boxShadow: 'none !important',
              outline: 'none !important',
            },
            '&:focus, &:focus-visible, &:active': {
              border: '0 !important',
              boxShadow: 'none !important',
              outline: 'none !important',
            },
          }}
        >
          {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
        </IconButton>
      </Box>

      {/* Left panel — branding */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          px: 8,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <MotionBox
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: '#FFFFFF',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            >
              RC
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ color: 'text.primary', lineHeight: 1 }}
              >
                RoomCraft Studio
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Designer Portal
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={<DesignServices />}
            label="Designer Access Only"
            sx={{
              mb: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              fontWeight: 600,
            }}
          />

          <Typography
            variant="h2"
            sx={{
              color: 'text.primary',
              mb: 3,
              fontSize: { lg: '2.5rem', xl: '3rem' },
              lineHeight: 1.15,
            }}
          >
            Welcome to the{' '}
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Designer
            </Box>{' '}
            Portal
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 5, maxWidth: 440 }}
          >
            Manage your design portfolio, create stunning 2D and 3D room visualisations, and
            help customers find their perfect furniture arrangement.
          </Typography>

          <Stack spacing={2.5}>
            {[
              { label: 'Create & manage room designs', color: theme.palette.primary.main },
              { label: 'Real-time 2D & 3D visualisation', color: '#8B5CF6' },
              { label: 'Customer consultation tools', color: '#10B981' },
              { label: 'Design portfolio management', color: '#F59E0B' },
            ].map(({ label, color }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${alpha(color, 0.6)}`,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </MotionBox>
      </Box>

      {/* Colored divider between panels (desktop only) */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          alignSelf: 'stretch',
          width: '1px',
          background: `linear-gradient(
            180deg,
            ${alpha(theme.palette.primary.main, 0.0)} 0%,
            ${alpha(theme.palette.primary.main, 0.7)} 40%,
            ${alpha(theme.palette.secondary.main, 0.9)} 100%
          )`,
          opacity: 0.9,
        }}
      />

      {/* Right panel — login form */}
      <Box
        sx={{
          flex: { xs: 1, lg: '0 0 500px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          sx={{
            width: '100%',
            maxWidth: 420,
            backgroundColor:
              resolvedMode === 'dark'
                ? alpha('#020617', 0.9)
                : alpha('#FFFFFF', 0.92),
            borderRadius: 4,
            p: { xs: 3, sm: 5 },
            border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            boxShadow: 'none',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
          }}
        >
          {/* Mobile logo */}
          <Box
            sx={{
              display: { xs: 'flex', lg: 'none' },
              alignItems: 'center',
              gap: 1.5,
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              RC
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1 }}>
                RoomCraft Studio
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Designer Portal
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
              }}
            >
              <DesignServices sx={{ color: 'primary.main', fontSize: 28 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Designer Sign In
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Access your design portfolio and tools
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Designer login form"
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

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isLoading || isSubmitting}
                endIcon={<ArrowForward />}
                sx={{ py: 1.75, mt: 0.5 }}
                aria-label="Sign in to designer portal"
              >
                {isLoading || isSubmitting ? 'Signing In…' : 'Sign In to Portal'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.6) }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Not a designer account?
            </Typography>
            <Button
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              size="small"
              endIcon={<OpenInNew fontSize="small" />}
              sx={{ color: 'secondary.main', fontWeight: 600 }}
            >
              Go to Customer Portal
            </Button>
          </Box>

          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}
            >
              This portal is restricted to authorised RoomCraft Studio designers only.
              Unauthorised access attempts are logged.
            </Typography>
          </Box>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default LoginPage;
