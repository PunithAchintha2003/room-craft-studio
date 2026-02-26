import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Drawer,
  Button,
  Switch,
  FormControlLabel,
  Skeleton,
  Avatar,
  alpha,
  useTheme,
  Stack,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search,
  Edit,
  Close,
  PersonOff,
  PersonAdd,
  Refresh,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { fetchUsers, updateUser } from '@/services/users.api';
import { User, UserRole } from '@/types/auth.types';
import { UserListParams } from '@/types/user.types';

const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#8B5CF6',
  designer: '#3B82F6',
  user: '#10B981',
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  designer: 'Designer',
  user: 'User',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface EditState {
  open: boolean;
  user: User | null;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  saving: boolean;
}

const initEdit = (): EditState => ({
  open: false,
  user: null,
  name: '',
  email: '',
  role: 'user',
  isActive: true,
  saving: false,
});

export const UserManagementPage: React.FC = () => {
  const theme = useTheme();

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [edit, setEdit] = useState<EditState>(initEdit());

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: UserListParams = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;
      if (search) params.search = search;

      const result = await fetchUsers(params);
      setUsers(result.users);
      setTotal(result.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, roleFilter, statusFilter, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openEdit = (user: User) => {
    setEdit({
      open: true,
      user,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      saving: false,
    });
  };

  const closeEdit = () => setEdit(initEdit());

  const handleSave = async () => {
    if (!edit.user) return;
    setEdit((s) => ({ ...s, saving: true }));
    try {
      const updated = await updateUser(edit.user._id, {
        role: edit.role,
        isActive: edit.isActive,
      });
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      toast.success('User updated successfully');
      closeEdit();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update user';
      toast.error(msg);
      setEdit((s) => ({ ...s, saving: false }));
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const updated = await updateUser(user._id, { isActive: !user.isActive });
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      toast.success(`User ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleRoleFilterChange = (e: SelectChangeEvent<string>) => {
    setRoleFilter(e.target.value as UserRole | 'all');
    setPage(0);
  };

  const handleStatusFilterChange = (e: SelectChangeEvent<string>) => {
    setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
    setPage(0);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage all registered client accounts
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={loadUsers} sx={{ color: 'text.secondary' }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 260, flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} label="Role" onChange={handleRoleFilterChange}>
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="designer">Designer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={handleStatusFilterChange}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 'auto' }}>
            {loading ? '…' : `${total} result${total !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Skeleton variant="circular" width={36} height={36} />
                          <Box>
                            <Skeleton variant="text" width={120} />
                            <Skeleton variant="text" width={160} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Skeleton variant="rounded" width={70} height={24} /></TableCell>
                      <TableCell><Skeleton variant="rounded" width={70} height={24} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell align="right"><Skeleton variant="rounded" width={80} height={32} /></TableCell>
                    </TableRow>
                  ))
                : users.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No users found matching your filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                : users.map((user) => (
                    <TableRow
                      key={user._id}
                      hover
                      sx={{ '&:last-child td': { border: 0 } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: alpha(ROLE_COLORS[user.role], 0.15),
                              color: ROLE_COLORS[user.role],
                              fontWeight: 700,
                              fontSize: '0.875rem',
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ROLE_LABELS[user.role]}
                          size="small"
                          sx={{
                            backgroundColor: alpha(ROLE_COLORS[user.role], 0.12),
                            color: ROLE_COLORS[user.role],
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            backgroundColor: user.isActive
                              ? alpha('#10B981', 0.12)
                              : alpha('#EF4444', 0.12),
                            color: user.isActive ? '#10B981' : '#EF4444',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {formatDate(user.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Edit user">
                            <IconButton size="small" onClick={() => openEdit(user)} sx={{ color: 'text.secondary' }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleActive(user)}
                              sx={{ color: user.isActive ? '#EF4444' : '#10B981' }}
                            >
                              {user.isActive ? <PersonOff fontSize="small" /> : <PersonAdd fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
        />
      </Card>

      {/* Edit Drawer */}
      <Drawer
        anchor="right"
        open={edit.open}
        onClose={closeEdit}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            backgroundColor: 'background.paper',
            p: 0,
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Drawer header */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Edit User
            </Typography>
            <IconButton size="small" onClick={closeEdit} sx={{ color: 'text.secondary' }}>
              <Close />
            </IconButton>
          </Box>

          {/* Drawer body */}
          <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 3 }}>
            {edit.user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha(ROLE_COLORS[edit.user.role], 0.15),
                    color: ROLE_COLORS[edit.user.role],
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}
                >
                  {edit.user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {edit.user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    ID: {edit.user._id}
                  </Typography>
                </Box>
              </Box>
            )}

            <Divider sx={{ mb: 3, borderColor: alpha(theme.palette.divider, 0.5) }} />

            <Stack spacing={2.5}>
              <TextField
                label="Full Name"
                value={edit.name}
                fullWidth
                size="small"
                disabled
                helperText="Name cannot be changed by admin"
              />
              <TextField
                label="Email Address"
                type="email"
                value={edit.email}
                fullWidth
                size="small"
                disabled
                helperText="Email cannot be changed by admin"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={edit.role}
                  label="Role"
                  onChange={(e) => setEdit((s) => ({ ...s, role: e.target.value as UserRole }))}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="designer">Designer</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={edit.isActive}
                      onChange={(e) => setEdit((s) => ({ ...s, isActive: e.target.checked }))}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Account Active
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Inactive users cannot log in
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Stack>
          </Box>

          {/* Drawer footer */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              display: 'flex',
              gap: 1.5,
            }}
          >
            <Button variant="outlined" onClick={closeEdit} fullWidth sx={{ borderColor: alpha(theme.palette.divider, 0.8), color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={edit.saving}
              fullWidth
            >
              {edit.saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default UserManagementPage;
