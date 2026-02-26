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
  DesignServices,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { fetchUsers, updateUser } from '@/services/users.api';
import { User, UserRole } from '@/types/auth.types';
import { UserListParams } from '@/types/user.types';

const DESIGNER_COLOR = '#3B82F6';

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
  role: 'designer',
  isActive: true,
  saving: false,
});

export const DesignerManagementPage: React.FC = () => {
  const theme = useTheme();

  const [designers, setDesigners] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [edit, setEdit] = useState<EditState>(initEdit());

  const loadDesigners = useCallback(async () => {
    setLoading(true);
    try {
      const params: UserListParams = {
        role: 'designer',
        page: page + 1,
        limit: rowsPerPage,
      };
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;
      if (search) params.search = search;

      const result = await fetchUsers(params);
      setDesigners(result.users);
      setTotal(result.total);
    } catch {
      toast.error('Failed to load designers');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, search]);

  useEffect(() => {
    loadDesigners();
  }, [loadDesigners]);

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
      setDesigners((prev) => {
        const next = prev.map((u) => (u._id === updated._id ? updated : u));
        // If role changed away from designer, remove from list
        return next.filter((u) => u.role === 'designer');
      });
      toast.success('Designer updated successfully');
      closeEdit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update designer';
      toast.error(msg);
      setEdit((s) => ({ ...s, saving: false }));
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const updated = await updateUser(user._id, { isActive: !user.isActive });
      setDesigners((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      toast.success(`Designer ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update designer status');
    }
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
            Designer Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage all designer accounts and their access
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={loadDesigners} sx={{ color: 'text.secondary' }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary card */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Designers', value: total, color: DESIGNER_COLOR },
        ].map((s) => (
          <Card key={s.label} sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: alpha(s.color, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s.color,
              }}
            >
              <DesignServices />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1 }}>
                {loading ? '…' : s.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {s.label}
              </Typography>
            </Box>
          </Card>
        ))}
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
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={handleStatusFilterChange}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 'auto' }}>
            {loading ? '…' : `${total} designer${total !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Designer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
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
                : designers.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <DesignServices sx={{ fontSize: 40, color: alpha(DESIGNER_COLOR, 0.3), mb: 1, display: 'block', mx: 'auto' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No designers found matching your filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                : designers.map((designer) => (
                    <TableRow
                      key={designer._id}
                      hover
                      sx={{ '&:last-child td': { border: 0 } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: alpha(DESIGNER_COLOR, 0.15),
                              color: DESIGNER_COLOR,
                              fontWeight: 700,
                              fontSize: '0.875rem',
                            }}
                          >
                            {designer.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {designer.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {designer.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Designer"
                          size="small"
                          sx={{
                            backgroundColor: alpha(DESIGNER_COLOR, 0.12),
                            color: DESIGNER_COLOR,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={designer.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            backgroundColor: designer.isActive
                              ? alpha('#10B981', 0.12)
                              : alpha('#EF4444', 0.12),
                            color: designer.isActive ? '#10B981' : '#EF4444',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {formatDate(designer.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Edit designer">
                            <IconButton size="small" onClick={() => openEdit(designer)} sx={{ color: 'text.secondary' }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={designer.isActive ? 'Deactivate' : 'Activate'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleActive(designer)}
                              sx={{ color: designer.isActive ? '#EF4444' : '#10B981' }}
                            >
                              {designer.isActive ? <PersonOff fontSize="small" /> : <PersonAdd fontSize="small" />}
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
              Edit Designer
            </Typography>
            <IconButton size="small" onClick={closeEdit} sx={{ color: 'text.secondary' }}>
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 3 }}>
            {edit.user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha(DESIGNER_COLOR, 0.15),
                    color: DESIGNER_COLOR,
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
                  <MenuItem value="user">User (demote)</MenuItem>
                  <MenuItem value="designer">Designer</MenuItem>
                  <MenuItem value="admin">Admin (promote)</MenuItem>
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
                        Inactive designers cannot log in
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              display: 'flex',
              gap: 1.5,
            }}
          >
            <Button
              variant="outlined"
              onClick={closeEdit}
              fullWidth
              sx={{ borderColor: alpha(theme.palette.divider, 0.8), color: 'text.secondary' }}
            >
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

export default DesignerManagementPage;
