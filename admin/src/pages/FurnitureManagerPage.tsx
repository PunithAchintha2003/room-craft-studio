import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import {
  fetchFurniture,
  clearError,
  createFurniture,
  createFurnitureWithAssets,
  updateFurniture,
  deleteFurniture,
  fetchFurnitureCategories,
  createFurnitureCategory,
} from '@/features/furniture/furnitureSlice';
import { FurnitureThumbnailUploader } from '@/components/furniture/FurnitureThumbnailUploader';
import { Furniture, FurnitureCategory } from '@/types/design.types';
import { FurnitureFormDialog } from '@/components/furniture/FurnitureFormDialog';
import { formatCurrencyLKR } from '@/utils/currency';

export const FurnitureManagerPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { furniture, categories, isLoading, isSaving, deletingId, error, isCreatingCategory } = useSelector(
    (state: RootState) => state.furniture
  );
  const [uploadTarget, setUploadTarget] = useState<Furniture | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FurnitureCategory | 'all'>('all');
  const [minStock, setMinStock] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<Furniture | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Furniture | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');

  useEffect(() => {
    dispatch(fetchFurniture(undefined));
    dispatch(fetchFurnitureCategories());
  }, [dispatch]);

  const filteredFurniture = useMemo(() => {
    return furniture
      .filter((item) => {
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
        if (search.trim()) {
          const term = search.toLowerCase();
          if (
            !item.name.toLowerCase().includes(term) &&
            !item.category.toLowerCase().includes(term)
          ) {
            return false;
          }
        }
        const min = parseInt(minStock, 10);
        if (Number.isFinite(min) && item.stock < min) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [furniture, categoryFilter, search, minStock]);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: Furniture) => {
    setFormMode('edit');
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmitForm = async (values: any) => {
    if (formMode === 'create') {
      if (values instanceof FormData) {
        await dispatch(createFurnitureWithAssets(values)).unwrap();
      } else {
        await dispatch(createFurniture(values as any)).unwrap();
      }
    } else if (formMode === 'edit' && editingItem) {
      await dispatch(
        updateFurniture({
          id: editingItem._id,
          input: values as any,
        })
      ).unwrap();
    }
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteFurniture(deleteTarget._id)).unwrap();
    setDeleteTarget(null);
  };

  const handleCreateCategory = async () => {
    const label = newCategoryLabel.trim();
    if (!label) return;
    const slug = await dispatch(createFurnitureCategory({ label })).unwrap();
    setCategoryDialogOpen(false);
    setNewCategoryLabel('');
    // Make it immediately usable as a filter if the user wants.
    setCategoryFilter(slug);
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
            Furniture Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Add, edit, or remove furniture items in your catalog
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => dispatch(fetchFurniture(undefined))} sx={{ color: 'text.secondary' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Add furniture
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 260, flex: 1 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              select
              label="Category"
              size="small"
              sx={{ minWidth: 200 }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as FurnitureCategory | 'all')}
            >
              <MenuItem value="all">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
            <Tooltip title="Add category">
              <IconButton onClick={() => setCategoryDialogOpen(true)} size="small">
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <TextField
            label="Min stock"
            size="small"
            type="number"
            sx={{ width: 120 }}
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            inputProps={{ min: 0, step: 1 }}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 'auto' }}>
            {isLoading ? '…' : `${filteredFurniture.length} item${filteredFurniture.length !== 1 ? 's' : ''}`}
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

      {!isLoading && filteredFurniture.length === 0 && (
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
            No furniture items found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seed the catalog or add your first furniture item to get started.
          </Typography>
        </Card>
      )}

      {!isLoading && filteredFurniture.length > 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderSx}>Thumbnail</TableCell>
                  <TableCell sx={tableHeaderSx}>Name</TableCell>
                  <TableCell sx={tableHeaderSx}>Category</TableCell>
                  <TableCell sx={tableHeaderSx}>Dimensions (m)</TableCell>
                  <TableCell align="right" sx={tableHeaderSx}>Price</TableCell>
                  <TableCell align="center" sx={tableHeaderSx}>Stock</TableCell>
                  <TableCell align="right" sx={tableHeaderSx}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFurniture.map((item) => (
                  <TableRow key={item._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Box
                        component="img"
                        src={item.thumbnail}
                        alt={item.thumbnailAlt ?? item.name}
                        sx={{
                          width: 80,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1,
                          bgcolor: 'grey.200',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.category}
                        size="small"
                        sx={{
                          textTransform: 'capitalize',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.dimensions.width} × {item.dimensions.length} × {item.dimensions.height}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrencyLKR(item.price)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{item.stock}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ImageIcon />}
                          onClick={() => setUploadTarget(item)}
                        >
                          Image
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="text"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDeleteTarget(item)}
                          disabled={deletingId === item._id}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {uploadTarget && (
        <FurnitureThumbnailUploader
          open={!!uploadTarget}
          onClose={() => setUploadTarget(null)}
          furniture={uploadTarget}
        />
      )}

      <FurnitureFormDialog
        open={formOpen}
        mode={formMode}
        initialValue={editingItem ?? undefined}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmitForm}
        isSubmitting={isSaving}
        categories={categories}
        onAddCategory={async (label) => {
          const slug = await dispatch(createFurnitureCategory({ label })).unwrap();
          return slug;
        }}
      />

      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category name"
            fullWidth
            value={newCategoryLabel}
            onChange={(e) => setNewCategoryLabel(e.target.value)}
            placeholder="E.g. Outdoor"
          />
          <Typography variant="caption" color="text.secondary">
            This will create a kebab-case slug automatically (e.g. “Outdoor” → “outdoor”).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)} disabled={isCreatingCategory}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateCategory}
            disabled={isCreatingCategory || !newCategoryLabel.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {deleteTarget && (
        <Dialog open onClose={() => setDeleteTarget(null)}>
          <DialogTitle>Delete furniture</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete &quot;{deleteTarget.name}&quot;? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteTarget(null)} disabled={deletingId === deleteTarget._id}>
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleConfirmDelete}
              disabled={deletingId === deleteTarget._id}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default FurnitureManagerPage;
