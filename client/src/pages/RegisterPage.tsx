import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  LinearProgress,
  Divider,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  EmailOutlined,
  LockOutlined,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { registerUser, clearError } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, RegisterFormData, getPasswordStrength } from '@/utils/validators';

const MotionBox = motion(Box);

const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {met ? (
      <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
    ) : (
      <Cancel sx={{ fontSize: 14, color: 'text.disabled' }} />
    )}
    <Typography variant="caption" sx={{ color: met ? 'success.main' : 'text.disabled' }}>
      {text}
    </Typography>
  </Box>
);

export const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password', '');
  const passwordStrength = getPasswordStrength(passwordValue);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const onSubmit = async (data: RegisterFormData) => {
    const result = await dispatch(
      registerUser({ name: data.name, email: data.email, password: data.password })
    );
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created successfully. Welcome!');
      navigate('/');
    }
  };

  const passwordRequirements = [
    { met: passwordValue.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(passwordValue), text: 'One uppercase letter' },
    { met: /[a-z]/.test(passwordValue), text: 'One lowercase letter' },
    { met: /[0-9]/.test(passwordValue), text: 'One number' },
    { met: /[^A-Za-z0-9]/.test(passwordValue), text: 'One special character' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #1B2E42 100%)`,
      }}
    >
      {/* Left panel — branding */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          px: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`,
          }}
        />
        <MotionBox
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #E8A045 0%, #F0B96A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#0D1B2A',
              }}
            >
              RC
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: 'white' }}>
              RoomCraft Studio
            </Typography>
          </Box>
          <Typography
            variant="h2"
            sx={{ color: 'white', mb: 3, fontSize: '2.5rem', lineHeight: 1.2 }}
          >
            Design your perfect room with confidence
          </Typography>
          <Typography variant="body1" sx={{ color: alpha('#FFFFFF', 0.7), lineHeight: 1.8, mb: 5 }}>
            Join thousands of homeowners and designers who use RoomCraft Studio to visualise
            furniture layouts in stunning 2D and 3D before making a purchase.
          </Typography>
          <Stack spacing={2}>
            {[
              'Interactive 2D floor plan editor',
              'Photorealistic 3D visualisation',
              'Unlimited design saves',
              '500+ furniture items to explore',
            ].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircle sx={{ color: 'secondary.main', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.8) }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Stack>
        </MotionBox>
      </Box>

      {/* Right panel — form */}
      <Box
        sx={{
          flex: { xs: 1, lg: '0 0 480px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          sx={{
            width: '100%',
            maxWidth: 440,
            backgroundColor: 'background.paper',
            borderRadius: 4,
            p: { xs: 3, sm: 5 },
            boxShadow: `0 40px 80px ${alpha('#000000', 0.3)}`,
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Create your account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <MuiLink component={Link} to="/login" color="primary" fontWeight={600}>
                Sign in
              </MuiLink>
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Registration form"
          >
            <Stack spacing={2.5}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    autoComplete="name"
                    autoFocus
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    inputProps={{ 'aria-label': 'Full name', 'aria-required': 'true' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutline sx={{ color: 'text.disabled', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

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

              <Box>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      autoComplete="new-password"
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

                {passwordValue && (
                  <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="caption" color="text.secondary">
                        Password strength
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.label}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(passwordStrength.score / 6) * 100}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: alpha(passwordStrength.color, 0.15),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: passwordStrength.color,
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 0.5,
                        mt: 1.5,
                      }}
                    >
                      {passwordRequirements.map((req) => (
                        <PasswordRequirement key={req.text} met={req.met} text={req.text} />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Confirm Password"
                    type={showConfirm ? 'text' : 'password'}
                    fullWidth
                    autoComplete="new-password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    inputProps={{ 'aria-label': 'Confirm password', 'aria-required': 'true' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: 'text.disabled', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirm(!showConfirm)}
                            edge="end"
                            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                            size="small"
                          >
                            {showConfirm ? <VisibilityOff /> : <Visibility />}
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
                sx={{ py: 1.75, mt: 1 }}
                aria-label="Create account"
              >
                {isLoading || isSubmitting ? 'Creating Account…' : 'Create Account'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              By creating an account, you agree to our
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              <MuiLink href="#" color="primary">
                Terms of Service
              </MuiLink>{' '}
              and{' '}
              <MuiLink href="#" color="primary">
                Privacy Policy
              </MuiLink>
            </Typography>
          </Box>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default RegisterPage;
