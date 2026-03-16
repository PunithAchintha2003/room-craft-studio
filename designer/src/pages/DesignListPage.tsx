import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  TablePagination,
  alpha,
  useTheme,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { fetchDesigns, deleteDesign, duplicateDesign, setCurrentDesign, clearError } from '@/features/design/designSlice';
import toast from 'react-hot-toast';

export const DesignListPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { designs, isLoading, error } = useSelector((state: RootState) => state.design);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchDesigns());
  }, [dispatch]);

  const handleNewDesign = () => {
    dispatch(setCurrentDesign(null));
    navigate('/editor');
  };

  const handleEditDesign = (id: string) => {
    navigate(`/editor/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setDesignToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!designToDelete) return;

    try {
      await dispatch(deleteDesign(designToDelete)).unwrap();
      toast.success('Design deleted successfully');
      setDeleteDialogOpen(false);
      setDesignToDelete(null);
    } catch (err) {
      toast.error('Failed to delete design');
      console.error(err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await dispatch(duplicateDesign(id)).unwrap();
      toast.success('Design duplicated successfully');
    } catch (err) {
      toast.error('Failed to duplicate design');
      console.error(err);
    }
  };

  const filteredDesigns = designs.filter((design) =>
    design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (design.description && design.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedDesigns = filteredDesigns.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tableHeaderSx = {
    fontWeight: 700,
    color: 'text.secondary',
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            All Designs
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            View and manage all room designs
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => dispatch(fetchDesigns())} sx={{ color: 'text.secondary' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewDesign}>
            New Design
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search designs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 260, flex: 1 }}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 'auto' }}>
            {filteredDesigns.length} design{filteredDesigns.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <Card>
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        </Card>
      )}

      {!isLoading && !error && filteredDesigns.length === 0 && (
        <Card
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            borderStyle: 'dashed',
            borderWidth: 1.5,
            borderColor: alpha(theme.palette.divider, 0.8),
          }}
        >
          <Typography variant="h6" gutterBottom>
            {searchTerm ? 'No designs found' : 'No designs yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm
              ? 'Try adjusting your search term'
              : 'Get started by creating your first room design'}
          </Typography>
          {!searchTerm && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewDesign}>
              Create Your First Design
            </Button>
          )}
        </Card>
      )}

      {!isLoading && !error && filteredDesigns.length > 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderSx}>Name</TableCell>
                  <TableCell sx={tableHeaderSx}>Description</TableCell>
                  <TableCell align="center" sx={tableHeaderSx}>Room Size</TableCell>
                  <TableCell align="center" sx={tableHeaderSx}>Furniture</TableCell>
                  <TableCell align="center" sx={tableHeaderSx}>Status</TableCell>
                  <TableCell sx={tableHeaderSx}>Last Updated</TableCell>
                  <TableCell align="right" sx={tableHeaderSx}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDesigns.map((design) => (
                  <TableRow
                    key={design._id}
                    hover
                    sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                    onClick={() => handleEditDesign(design._id)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {design.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {design.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {design.room.width}m × {design.room.length}m
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={design.furniture.length}
                        size="small"
                        sx={{
                          backgroundColor: design.furniture.length > 0
                            ? alpha(theme.palette.primary.main, 0.12)
                            : alpha(theme.palette.divider, 0.5),
                          color: design.furniture.length > 0 ? 'primary.main' : 'text.secondary',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {design.isPublic ? (
                        <Chip
                          label="Public"
                          size="small"
                          sx={{
                            backgroundColor: alpha('#10B981', 0.12),
                            color: '#10B981',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      ) : (
                        <Chip
                          label="Private"
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.divider, 0.5),
                            color: 'text.secondary',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(design.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditDesign(design._id)} sx={{ color: 'text.secondary' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                          <IconButton size="small" onClick={() => handleDuplicate(design._id)} sx={{ color: 'text.secondary' }}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(design._id)}
                          >
                            <DeleteIcon fontSize="small" />
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
            count={filteredDesigns.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
          />
        </Card>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Design</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this design? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DesignListPage;
