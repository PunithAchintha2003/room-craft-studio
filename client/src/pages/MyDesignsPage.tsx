import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  CardContent,
  CardMedia,
  CardActions,
  Button,
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
} from '@mui/material';
import { GlassCard } from '@/components/common/GlassCard';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ShareIcon from '@mui/icons-material/Share';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { fetchDesigns, deleteDesign, setCurrentDesign } from '@/features/design/designSlice';
import { addDesignToCart } from '@/features/cart/cartSlice';
import toast from 'react-hot-toast';

export const MyDesignsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { designs, loading, error } = useSelector((state: RootState) => state.design);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchDesigns());
  }, [dispatch]);

  const handleNewDesign = () => {
    dispatch(setCurrentDesign(null));
    navigate('/editor');
  };

  const handleViewDesign = (id: string) => {
    navigate(`/design-viewer/${id}`);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleShareDesign = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/design-viewer/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success(`Share link for "${name}" copied to clipboard`);
  };

  const handleShopDesign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dispatch(addDesignToCart(id)).unwrap();
      toast.success('All items from design added to cart! 🛒');
      navigate('/cart');
    } catch (error) {
      toast.error('Failed to add items to cart');
    }
  };

  const filteredDesigns = designs.filter((design) =>
    design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (design.description && design.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" gutterBottom>
                My Designs
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View and manage your saved room designs
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewDesign}>
              New Design
            </Button>
          </Box>

          <TextField
            fullWidth
            placeholder="Search your designs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3, maxWidth: 500 }}
          />
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && filteredDesigns.length === 0 && (
          <GlassCard
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {searchTerm ? 'No designs found' : 'No designs yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm
                ? 'Try adjusting your search term'
                : 'Visit our furniture catalog to create your first room design'}
            </Typography>
            {!searchTerm && (
              <Button variant="contained" onClick={() => navigate('/furniture')}>
                Browse Furniture
              </Button>
            )}
          </GlassCard>
        )}

        {!loading && !error && filteredDesigns.length > 0 && (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredDesigns.length} design{filteredDesigns.length !== 1 ? 's' : ''} found
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {filteredDesigns.map((design) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={design._id}>
                  <GlassCard
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => handleViewDesign(design._id)}
                  >
                    <CardMedia
                      sx={{
                        height: 180,
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          textAlign: 'center',
                          color: 'text.secondary',
                        }}
                      >
                        <Typography variant="caption" display="block">
                          Room: {design.room.width}m × {design.room.length}m
                        </Typography>
                        <Typography variant="caption" display="block">
                          Furniture: {design.furniture.length} items
                        </Typography>
                      </Box>
                    </CardMedia>

                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom noWrap>
                        {design.name}
                      </Typography>
                      {design.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {design.description}
                        </Typography>
                      )}
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={`${design.furniture.length} items`}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {design.isPublic && (
                          <Chip label="Public" size="small" color="primary" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                        Last updated: {formatDate(design.updatedAt)}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ShoppingCartIcon />}
                        onClick={(e) => handleShopDesign(design._id, e)}
                      >
                        Shop Design
                      </Button>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleShareDesign(design._id, design.name, e)}
                          title="Share"
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDeleteClick(design._id, e)}
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardActions>
                  </GlassCard>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
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
      </Container>
    </Box>
  );
};

export default MyDesignsPage;
