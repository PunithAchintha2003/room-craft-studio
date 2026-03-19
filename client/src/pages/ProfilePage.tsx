import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  alpha,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, changePassword, clearError } from '@/features/auth/authSlice';
import {
  profileUpdateSchema,
  changePasswordSchema,
  type ProfileUpdateFormData,
  type ChangePasswordFormData,
} from '@/utils/validators';
import { notify } from '@/lib/notifications';

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]![0] ?? '').toUpperCase() + (parts[1]![0] ?? '').toUpperCase();
};

const formatMemberSince = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return '—';
  }
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  designer: 'Designer',
  user: 'Member',
};

export const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user, error } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const editForm = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    mode: 'onBlur',
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  useEffect(() => {
    if (user) {
      editForm.reset({ name: user.name, email: user.email });
    }
  }, [user?._id, user?.name, user?.email]);

  useEffect(() => {
    if (error) {
      notify.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (editOpen && user) {
      editForm.reset({ name: user.name, email: user.email });
    }
  }, [editOpen, user?.name, user?.email]);

  const onEditSubmit = async (data: ProfileUpdateFormData) => {
    const result = await dispatch(updateProfile({ name: data.name, email: data.email }));
    if (updateProfile.fulfilled.match(result)) {
      notify.success('Profile updated successfully');
      setEditOpen(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    const result = await dispatch(
      changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
    );
    if (changePassword.fulfilled.match(result)) {
      notify.success('Password changed successfully');
      setPasswordOpen(false);
      passwordForm.reset({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading your profile…</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      {/* Profile header */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
        }}
      >
        <Avatar
          src={user.avatar}
          sx={{
            width: 96,
            height: 96,
            mx: 'auto',
            mb: 2,
            bgcolor: 'secondary.main',
            color: 'primary.contrastText',
            fontSize: '2.25rem',
          }}
        >
          {getInitials(user.name)}
        </Avatar>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {user.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          {user.email}
        </Typography>
        <Stack direction="row" justifyContent="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
          <Chip
            label={ROLE_LABELS[user.role] ?? user.role}
            size="small"
            color="secondary"
            variant="outlined"
          />
          <Chip
            icon={<CalendarIcon sx={{ fontSize: 16 }} />}
            label={`Member since ${formatMemberSince(user.createdAt)}`}
            size="small"
            variant="outlined"
            sx={{ borderColor: alpha(theme.palette.text.primary, 0.2) }}
          />
        </Stack>
      </Box>

      <Stack spacing={3}>
        {/* Personal information */}
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Personal information
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setEditOpen(true)}
              >
                Edit
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user.name}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Security */}
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Security
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<LockIcon />}
                onClick={() => setPasswordOpen(true)}
              >
                Change password
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Keep your account secure by using a strong password and updating it periodically.
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Controller
                name="name"
                control={editForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    autoComplete="name"
                    error={!!editForm.formState.errors.name}
                    helperText={editForm.formState.errors.name?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Controller
                name="email"
                control={editForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    autoComplete="email"
                    error={!!editForm.formState.errors.email}
                    helperText={editForm.formState.errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={editForm.formState.isSubmitting}>
              Save changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Change password dialog */}
      <Dialog open={passwordOpen} onClose={() => setPasswordOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
          <DialogTitle>Change password</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Controller
                name="currentPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Current password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    fullWidth
                    autoComplete="current-password"
                    error={!!passwordForm.formState.errors.currentPassword}
                    helperText={passwordForm.formState.errors.currentPassword?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword((p) => !p)}
                            edge="end"
                            aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Controller
                name="newPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New password"
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    autoComplete="new-password"
                    error={!!passwordForm.formState.errors.newPassword}
                    helperText={passwordForm.formState.errors.newPassword?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword((p) => !p)}
                            edge="end"
                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Controller
                name="confirmNewPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Confirm new password"
                    type="password"
                    fullWidth
                    autoComplete="new-password"
                    error={!!passwordForm.formState.errors.confirmNewPassword}
                    helperText={passwordForm.formState.errors.confirmNewPassword?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPasswordOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={passwordForm.formState.isSubmitting}>
              Update password
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
